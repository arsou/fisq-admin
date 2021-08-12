import {Formik,Form,FieldArray,FormikHelpers,FormikProps,ArrayHelpers} from "formik";
import { MouseEvent, useContext } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as Yup from "yup";
import { ItemEditor } from "./item-editor";
import { ItemViewer } from "./item-viewer";
import { AppContext } from "../app-context";
import { ShopItem } from "../../models/shop";
import { Session } from "../../utils/session";
import { ApiError } from "../utilitaire/api-error";
import { Loading } from "../utilitaire/loading";
import { Dummy } from "../utilitaire/dummy";
import {config} from "../../config";

type FormValue = {
  items: ShopItem[];
  error: string;
  success: string;
};

const DATA_TYPE = "shop";

const validationSchema = Yup.object().shape({
  items: Yup.array().of(ShopItem.validationSchema)
});

const api = config.API;

const get_headers = (session: Session) => ({
  Accept: "application/json", "Content-Type": "application/json",
  "x-access-token": session.token, "x-session-id": session.session_id
});

const initialValues: FormValue = {
  items: [] as ShopItem[],
  error: "",
  success: ""
};

const toggles = {} as { [k: string]: boolean };

export const Shop = () => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager("shop");
  const items = mngr.getItems() as ShopItem[];
  const session = ctx.sessionManager.getSession();
  const headers = get_headers(session);

  const onToggle = (evt: MouseEvent<HTMLDivElement>) => {
    const id = evt.currentTarget.dataset.id as string;
    toggles[id] = !toggles[id];
  };

  const onEditItem = (it: ShopItem, p: FormikProps<FormValue>) => {
    const items = [...p.values.items, ShopItem.clone(it)];
    toggles[it.id as string] = true;
    p.setValues({...p.values,items});
  };

  const onCancelItem = (id: string, p: FormikProps<FormValue>) => {
    const items = p.values.items.filter((it) => it.id !== id);
    p.setValues({...p.values,items});
  };

  const onDeleteItem = async (evt: MouseEvent<any>,it: ShopItem,p: FormikProps<FormValue>) => {
    if (!window.confirm(`supprimer la soirée "${it.title_fr}"`)) return;
    if (!it.id || it.id === "") return;
    const tgt = evt.currentTarget as HTMLElement;
    try {
      const id = it.id || "";
      tgt.classList.add("disabled");
      const r = await Axios.get(`${api}/${DATA_TYPE}/remove/${id}`, { headers });
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
    catch (err) {console.log(err);} 
    finally {tgt.classList.remove("disabled");}
  };

  const onUpdateItem = async (evt: MouseEvent<any>,index: number,p: FormikProps<FormValue>) => {
    const tgt = evt.currentTarget as HTMLElement;
    try {
      if (index >= p.values.items.length) return;
      const item = p.values.items[index];
      const body = { item };
      tgt.classList.add("disabled");
      const r = await Axios.post(`${api}/${DATA_TYPE}/update`, body,{headers});
      if (r.data.error) alert(r.data.message);
      else {
       // const items = p.values.items.filter((it) => it.id !== item.id);
        //p.setValues({ ...p.values, items });
        mngr.setItems(r.data, false);
        ctx.sessionManager.fromResponse(r.headers);
      }
    } 
    catch(err){console.log(err)} 
    finally{tgt.classList.remove("disabled")}
  };

  const addRate = (index: number,p: FormikProps<FormValue>,arr_h: ArrayHelpers) => {
    const item = ShopItem.clone(p.values.items[index]);
    item.rates.push({ amount: 0, date: "" });
    arr_h.replace(index, item);
  };

  const removeRate = (evt: MouseEvent<any>, index: number,p: FormikProps<FormValue>,
    arr_h: ArrayHelpers) => {
    const tgt = evt.currentTarget as HTMLElement;
    const rate_index = parseInt(tgt.dataset.rate_index as string, 10);
    const item = ShopItem.clone(p.values.items[index]);
    item.rates.splice(rate_index, 1);
    arr_h.replace(index, item);
  };

  const onSubmit = async (value: FormValue,formikHelper:FormikHelpers<FormValue>) => {};

  const render = (item: ShopItem,p: FormikProps<FormValue>,arr_h: ArrayHelpers) => {
    const [id, collapse] = [item.id || "", !toggles[item.id || ""]];
    const index = p.values.items.findIndex((n) => n.id === id);

    const onEdit = () => onEditItem(item, p);
    const onCancel = () => onCancelItem(id, p);
    const onAddRate = () => addRate(index, p, arr_h);
    const onRemoveRate = (evt: MouseEvent) => removeRate(evt, index, p, arr_h);
    const onDelete = (evt: MouseEvent<any>) => onDeleteItem(evt, item, p);
    const onUpdate = (evt: MouseEvent<any>) => onUpdateItem(evt, index, p);
    
    if(index < 0) return <ItemViewer {...{ item, collapse, onToggle, onEdit, onDelete }}/>
    else return <ItemEditor{...{item,index,collapse, onToggle,onAddRate,onRemoveRate,onUpdate,onCancel}}/>
  };

  return (
  <>{session.is_logged && 
    <Formik{...{ initialValues, validationSchema, onSubmit, validateOnBlur: true, validateOnMount: true}}>
    {(p: FormikProps<FormValue>) => 
    <>
      <div className="text-start text-white fs-5">Liste des items</div>
      <Dummy  data_type={DATA_TYPE}/>
      <Loading data_type={DATA_TYPE}/>
      <ApiError success={p.values.success} error={p.values.error} />

      <div>
        <div className="text-start my-1">
          <Link className="btn btn-sm btn-info" to="/shop_adder">+ Ajouter des items</Link>
        </div>
      </div>
      {!items.length && <div className="text-center fs-6">boutique vide</div>}
      <Form className="needs-validation" noValidate={true}>
        <div className="row g-1 p-1 bg-dark">
        <FieldArray name="items">
        {(arr_h: ArrayHelpers) =>items.map((it, i) =>
          <div key={i} className="col-12 col-md-6">{render(it, p, arr_h)}</div>
        )}
        </FieldArray>
        </div>
      </Form>
    </>
    }
    </Formik>
  }</>
  );
};
