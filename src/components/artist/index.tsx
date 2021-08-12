import {Formik, Form, FieldArray, FormikHelpers, FormikProps} from "formik";
import {ChangeEvent,MouseEvent, MouseEventHandler, useContext,useRef} from "react";
import Axios from "axios";
import { AppContext } from "../app-context";
import { arrayMove, formData} from "../../utils/util";
import { Session } from "../../utils/session";
import { ArtistItem } from "../../models/artist";
import { ArtistEditor } from "./artist_editor";
import { ApiError } from "../utilitaire/api-error";
import { Loading } from "../utilitaire/loading";
import { Dummy } from "../utilitaire/dummy";
import {SortableElement, SortableContainer} from "../utilitaire/sortable/sortable";
import {config} from "../../config";

const {MAX_FILE_SIZE,API} = config

const api = API;

const get_headers = (session: Session) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  "x-access-token": session.token,
  "x-session-id": session.session_id
});

type FormValue = {
  items: ArtistItem[];
  to_delete: { [id: string]: -1|1 };
  error: string;
  success: string;
  xhrs: { [k: string]: XMLHttpRequest };
  loading: boolean;
};

const SortableItem = SortableElement(ArtistEditor);

type SortableListProps = {
  values: FormValue;
  page: string;
  onSelectItem: MouseEventHandler;
};

const SortableList = SortableContainer((props: SortableListProps) => {
  const { page } = props;
  return (
    <div className="d-flex flex-row flex-wrap p-2 bg-dark">
    <FieldArray name="artists">
    {() =>props.values.items.map((a, index) =>
      <SortableItem
        key={a.id}
        sortableElmId={a.id as string}
        sortableElmIndex={index}
        {...{ artist: a, index, page, height: 150 }}
        to_delete={!!props.values.to_delete[a.id as string]}
        xhr={props.values.xhrs[a.id as string]}
        onSelect={props.onSelectItem}
      />
    )}
    </FieldArray>
    </div>
  );
});

const parseHeaders = (str: string) => {
  const headers: { [k: string]: string } = {};
  str.trim().split(/[\r\n]+/).forEach((line) => {
    const [h, ...rest] = line.split(": ");
    headers[h] = rest.join(": ");
  });
  return headers;
};


const initialValues: FormValue = {
  items: [] as ArtistItem[],
  to_delete: {},
  error: "",
  success: "",
  xhrs: {},
  loading: false
};

export const Artist = (props: { page?: string }) => {
  const DATA_TYPE = props?.page || "artists";
  const root = useRef<HTMLDivElement>(null);
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager(DATA_TYPE);
  const session = ctx.sessionManager.getSession();
  const headers = get_headers(session);

  const addItem = ( a: ArtistItem, xhr: XMLHttpRequest)=>{
    const { image_file, ...item } = a;
    const fd = formData({ image_file, item:JSON.stringify(item)});

    return new Promise<any>(resolve=> {
      const obj = { data: {}, headers: {} };
      xhr.open("POST", `${api}/${DATA_TYPE}/add`);
      xhr.responseType = "json";
      xhr.setRequestHeader("x-access-token", session.token);
      xhr.setRequestHeader("x-session-id", session.session_id);
      xhr.onload = () => (obj.data = xhr.response);
      xhr.onerror = () =>obj.data = { error: true, message: "ajout impossible" };
      xhr.onloadend = () => {
        obj.headers = parseHeaders(xhr.getAllResponseHeaders());
        resolve(obj);
      };
      xhr.send(fd);
    });
  };

  const onDelete = async (p: FormikProps<FormValue>) => {
    const entries=Object.entries(p.values.to_delete);
    const ids=entries.filter(e=>e[1]<0).map(([id,_])=>id);
    const remote_ids=entries.filter(([_,v])=>v>0).map(([id,_])=>id);
    let [error,success]=['',''];
    try {
      p.setSubmitting(true); 
      if(remote_ids.length){   
        const str_ids=remote_ids.join(',');
        const r = await Axios.get(`${api}/${DATA_TYPE}/remove/${str_ids}`,{headers});
        const sz=r.data.error?0:r.data.length;
        const str=sz<=1?'élément supprimé':'éléments supprimés';
        error=r.data.error?r.data.message:'';
        success=r.data.error?'':(!sz?`Aucun ${str}`:`${sz} ${str}`);
        if(!r.data.error){
          ids.push(...(r.data as string[]));
          mngr.remove(r.data as string[], false);
        }
        ctx.sessionManager.fromResponse(r.headers); 
      }
      const items=p.values.items.filter(it=>!ids.includes(it.id as string));
      const to_delete=Object.fromEntries(entries.filter(e=>!ids.includes(e[0])));
      p.setValues({...p.values,items,xhrs:{}, to_delete, error, success});
    } 
    catch (err) {console.log(err)}
    finally{p.setSubmitting(false)}
    
  };

  const onSubmit = async (value: FormValue,formikHelper: FormikHelpers<FormValue>) => {
    try {
      const items = [...value.items];
      const to_add = value.items.filter(a=> !!a.image_file);
      const errors = [] as string[];
      const xhrs = {} as { [id: string]: XMLHttpRequest };
      const to_delete = { ...value.to_delete };
      formikHelper.setSubmitting(true);
  
      if (to_add.length) {
        to_add.forEach(a=>xhrs[a.id as string] = new XMLHttpRequest());
        formikHelper.setFieldValue("xhrs", xhrs);

        const tab = await Promise.all(to_add.map(a=>addItem(a, xhrs[`${a.id}`])));

        tab.forEach((r, i) => {
          const id = to_add[i].id as string;
          const ind = items.findIndex(a=> a.id === id);
          if (ind >= 0) {
            if(r.data.error) {
              items.splice(ind, 1);
              errors.push(r.data.message);
              if (to_delete[id]) delete to_delete[id];
            } 
            else{
              items[ind] = r.data;
              if(to_delete[id]) to_delete[id]=1;
            }
          }
          delete xhrs[id];
        });
      }

      const r1 = await Axios.post(`${api}/${DATA_TYPE}/sort`,{artists:items},{headers});
      const error=r1.data.error?[r1.data.message, ...errors].join("<br/>"):'';
      const success=!r1.data.error?["Mise à jour effectuée ", ...errors].join("<br/>"):'';
      mngr.setItems(r1.data.error?items:r1.data, false);
      ctx.sessionManager.fromResponse(r1.headers);
      formikHelper.setValues({...value, error, success, to_delete, xhrs:{}});
    } 
    catch (err) {console.log(err)} 
    finally{formikHelper.setSubmitting(false)}

  };

  const onSelectItem = (p: FormikProps<FormValue>) => {
    return (evt: MouseEvent<HTMLElement>) => {
      const art_tgt = evt.currentTarget.closest(".artist") as HTMLElement;
      const id = art_tgt?.dataset.artist_id as string;
      const item=p.values.items.find(it=>it.id===id);
      if (!art_tgt || !id ||!item) return;
      const to_delete = { ...p.values.to_delete };
      if (to_delete[id]) delete to_delete[id];
      else to_delete[id] = item.image_file?-1:1;
      p.setFieldValue("to_delete", to_delete);
    };
  };

  const onSelectImages = (evt: ChangeEvent<HTMLInputElement>,p: FormikProps<FormValue>) => {
    const pref=DATA_TYPE.slice(0,-1);
    const ext = ".jpg,.png,.gif".split(",");
    const files = Array.from(evt.target.files || { length: 0 });
    const valid_img = (file: File) => {
      return ext.includes(file.name.toLowerCase().slice(-4)) && file.size <= MAX_FILE_SIZE;
    };

    const new_artist=(image_file:File)=>{
      const art={...ArtistItem.create(pref), image_file} as ArtistItem;
      if(DATA_TYPE!=='artists') delete art.type;
      return art;
    }
   
    const items =p.values.items.concat(
      files.filter(f=>valid_img(f)).map(image_file=>new_artist(image_file))
    );
    p.setValues({ ...p.values, items });
  };

  const onSortEnd = (p: FormikProps<FormValue>) => {
    return (old_index: number, new_index: number) => {
      const items = arrayMove(p.values.items, old_index, new_index);
      p.setValues({ ...p.values, items });
    };
  };

  return (
  <>
    {session.is_logged &&
    <Formik {...{initialValues,onSubmit,validateOnBlur: true,validateOnMount: true}}>
    {(p: FormikProps<FormValue>) =>
    <>
      <div className="text-start text-white fs-5 my-2">Liste des artistes</div>
      <Dummy data_type={DATA_TYPE}/>
      <Loading data_type={DATA_TYPE}/>
      <ApiError success={p.values.success} error={p.values.error} />

      {!p.values.items.length && 
        <div className="my-2 alert alert-secondary text-center fs-6">
          Aucun artiste pour l'instant
        </div>
      }

      {p.values.items.length > 0 &&
      <Form className="needs-validation" noValidate={true}>
        <div className="text-end mt-2">
          <div className="btn-group btn-group-sm">
            <button type="submit"className="btn btn-primary" disabled={p.isSubmitting}>
              Sauvegarder
            </button>

            <button type="button" className="btn btn-danger" title="Supprimer les éléments sélectionnés" onClick={() => onDelete(p)}
              disabled={p.isSubmitting || !Object.keys(p.values.to_delete).length}>
              Supprimer
            </button>
          </div>
        </div>
        <div ref={root}>
          <SortableList page={DATA_TYPE}
            values={{ ...p.values }}
            onSortEnd={onSortEnd(p)}
            onSelectItem={onSelectItem(p)}
          />
        </div>
      </Form>
      }
      <div className="border border-2 p-2 text-white bg-success">
        <label className="form-label">Sélectionner les images à ajouter</label>
        <input type="file" className="form-control" multiple={true} accept="image/gif, image/jpeg, image/png"
          onChange={(evt) => onSelectImages(evt, p)} />
      </div>
    </>
    }
    </Formik>
    }
  </>
  );
};
