import { Formik, Form, FieldArray, FormikHelpers, FormikProps } from "formik";
import { MouseEvent, useContext } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as Yup from "yup";
import { ItemEditor } from "./item-editor";
import { ItemViewer } from "./item-viewer";
import { AppContext } from "../app-context";
import { Night as NightType } from "../../models/night";
import { Session } from "../../utils/session";
import { ApiError } from "../utilitaire/api-error";
import { Loading } from "../utilitaire/loading";
import { Dummy } from "../utilitaire/dummy";
import {config} from "../../config";

const DATA_TYPE = "nights";

const validationSchema = Yup.object().shape({
  nights: Yup.array().of(NightType.validationSchema)
});

const api = config.API;

const get_headers = (session: Session) => ({
  Accept: "application/json", "Content-Type": "application/json",
  "x-access-token": session.token, "x-session-id": session.session_id
});

type FormValue = {items: NightType[], error: string, success: string};

const initialValues: FormValue = {
  items: [] as NightType[], 
  error: "", 
  success: ""
};
const toggles = {} as { [k: string]: boolean };

export const Night = () => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager("nights");
  const nights = mngr.getItems() as NightType[];
  const session = ctx.sessionManager.getSession();
  const headers = get_headers(session);

  const onToggle = (evt: MouseEvent<HTMLDivElement>) => {
    const id = evt.currentTarget.dataset.id as string;
    toggles[id] = !toggles[id];
  };

  const onEditItem = (it: NightType, p: FormikProps<FormValue>) => {
    const items = [...p.values.items, NightType.clone(it)];
    toggles[it.id as string] = true;
    p.setValues({ ...p.values, items });
  };

  const onCancelItem = (id: string, p: FormikProps<FormValue>) => {
    const items = p.values.items.filter((it) => it.id !== id);
    p.setValues({ ...p.values, items });
  };

  const onDeleteItem = async ( evt: MouseEvent<any>,it: NightType,p: FormikProps<FormValue>)=> {
    if (!window.confirm(`supprimer la soirée "${it.title_fr}"`)) return;
    if (!it.id || it.id === "") return;
    const tgt = evt.currentTarget as HTMLElement;
    try {
      const id = it.id || "";
      tgt.classList.add("disabled");
      const r = await Axios.get(`${api}/${DATA_TYPE}/remove/${id}`,{headers});
      if (r.data.error) alert(r.data.message);
      else {
        if (r.data.length) {
          //const items = p.values.items.filter((it) => it.id !== id);
          delete toggles[id];
          //p.setValues({ ...p.values, items });
          mngr.remove([id], false);
        }
        ctx.sessionManager.fromResponse(r.headers);
      }
    } 
    catch(err){console.log(err);} 
    finally {tgt.classList.remove("disabled");}
  };

  const onUpdateItem = async (evt: MouseEvent<any>, index: number, p: FormikProps<FormValue>) => {
    const tgt = evt.currentTarget as HTMLElement;
    try {
      if (index >= p.values.items.length) return;
      const night = p.values.items[index];
      const body = { night };
      tgt.classList.add("disabled");
      const r = await Axios.post(`${api}/nights/update`, body, { headers });
      if (r.data.error) alert(r.data.message);
      else {
        //const items = p.values.items.filter((it) => it.id !== night.id);
        //p.setValues({ ...p.values, items });
        mngr.setItems(r.data, false);
        ctx.sessionManager.fromResponse(r.headers);
      }
    } 
    catch (err) {console.log(err)} 
    finally {tgt.classList.remove("disabled")}
  };

  const onSubmit = async ( value: FormValue, formikHelper: FormikHelpers<FormValue>)=> {};

  const render = (night: NightType, p: FormikProps<FormValue>) => {
    const [id, collapse] = [night.id || "", !toggles[night.id || ""]];
    const index = p.values.items.findIndex((n) => n.id === id);

    const onEdit = () => onEditItem(night, p);
    const onCancel = () => onCancelItem(id, p);
    const onDelete = (evt: MouseEvent<any>) => onDeleteItem(evt, night, p);
    const onUpdate = (evt: MouseEvent<any>) => onUpdateItem(evt, index, p);
    if(index<0) return <ItemViewer {...{ night, collapse, onToggle, onEdit, onDelete }} />
    else return <ItemEditor {...{ night, index, collapse, onToggle, onUpdate, onCancel }}/>
  };

  return (
    <>
      {session.is_logged && (
        <Formik {...{initialValues, validationSchema, onSubmit, validateOnBlur: true, validateOnMount: true}}>
        {(p: FormikProps<FormValue>) =>
          <>
            <div>
              <div className="text-start text-white fs-5">Liste des soirées</div>
              <Dummy data_type={DATA_TYPE}/>
              <Loading data_type={DATA_TYPE}/>
              <ApiError success={p.values.success} error={p.values.error} />

              <div className="text-start my-1">
                <Link className="btn btn-sm btn-info" to="/nights_adder">+ Ajouter des soirées</Link>
              </div>
            </div>
            {!nights.length && 
              <div className="text-centre fs-6">Aucune soirée</div>
            }
            <Form className="needs-validation" noValidate={true}>
              <div className="row g-1 p-1 bg-dark">
              <FieldArray name="nights">
              {() =>nights.map((it, i) =>
                <div key={it.id} className="col-12 col-md-6">{render(it, p)}</div>
              )}
              </FieldArray>
              </div>
            </Form>
          </>
        }
        </Formik>
      )}
    </>
  );
};
