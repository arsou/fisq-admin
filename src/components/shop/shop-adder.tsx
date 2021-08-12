import {Formik, FormikProps, Form, FieldArray, ArrayHelpers,FormikHelpers,} from "formik"; 
import { MouseEvent, useContext,Fragment } from "react";
import {Link} from "react-router-dom";
import Axios from "axios";
import * as Yup from 'yup';
import {ShopItem} from "../../models/shop";
import {ItemAdder} from "./item-adder";
import {AppContext} from "../app-context";
import {config} from "../../config";


const validationSchema=Yup.object().shape({
  items:Yup.array().of(ShopItem.validationSchema)
});

const api=config.API;

type FormValue={items:ShopItem[],error:string,success:string};

const initialValues:FormValue={items:[ShopItem.create()], error:'', success:''};
const toggles={} as {[k:string]:boolean};

export const ShopAdder=()=>{

  const ctx=useContext(AppContext);
  const mngr=ctx.getDataManager('shop');
  const session=ctx.sessionManager.getSession();

  const headers={
    'Accept': 'application/json', 'Content-Type': 'application/json', 
    'x-access-token': session.token, 'x-session-id':session.session_id
  };

  const onToggle=(evt:MouseEvent<HTMLDivElement>)=>{
    const id=evt.currentTarget.dataset.id as string;
    toggles[id]=!toggles[id];
  }

  const onSubmit= async (value:FormValue,formikHelper:FormikHelpers<FormValue>)=>{
    const body={items:value.items};
    try{
      formikHelper.setSubmitting(true);
      const r= await Axios.post(`${api}/shop/add`,body,{headers});
      if(r.data.error) formikHelper.setValues({...value,success:'',error:r.data.message});
      else{
        const [success,error]=['ajout effectué avec success',''];
        mngr.setItems(r.data,false);
        ctx.sessionManager.fromResponse(r.headers);
        formikHelper.setValues({items:[ShopItem.create()],error, success});
      }
    }
    catch(err){console.log(err);}
    finally{formikHelper.setSubmitting(false);}
  }

  const onDelete=(i:number,id:string,arr_h:ArrayHelpers)=>{
    if(toggles[id]) delete toggles[id];
    arr_h.remove(i);   
  }
  
  const onAdd=(arr_h:ArrayHelpers)=>{
    arr_h.push(ShopItem.create());
  }

  const onAddRate=(index:number,p:FormikProps<FormValue>,arr_h:ArrayHelpers)=>{
    const item=ShopItem.clone(p.values.items[index]);
    item.rates.push({amount:0,date:''});
    arr_h.replace(index,item);
  }

  const onRemoveRate=(evt:MouseEvent<any>,index:number,p:FormikProps<FormValue>,arr_h:ArrayHelpers)=>{
    const tgt=evt.currentTarget as HTMLElement;
    const rate_index=parseInt(tgt.dataset.rate_index as string,10);
    const item=ShopItem.clone(p.values.items[index]);
    item.rates.splice(rate_index,1);
    arr_h.replace(index,item);
  }

  const onDuplicate=(it:ShopItem,i:number,arr_h:ArrayHelpers)=>{
    const item=ShopItem.duplicate(it);
    item.title_fr+='(copie)';
    item.title_en+='(copy)';
    arr_h.insert(i+1,item);
  }

  return (
  <>
  {session.is_logged &&
    <Formik {...{initialValues,validationSchema,onSubmit,validateOnBlur:true, validateOnMount:true}}>
    {(p:FormikProps<FormValue>)=>
      <Form className="needs-validation" noValidate={true}>
        <div className="col-12 text-end p-1">
          <div className="btn-group btn-group-sm">
            <Link className="btn btn-sm btn-info" to="/shop">+ revenir à la boutique</Link>
            {p.values.items.length>0 &&
            <button type="submit" className="btn btn-primary" disabled={p.isSubmitting || !p.isValid}>Ajouter</button>
            }
          </div>
        </div>
        {p.values.error!==''&& <div className="alert alert-danger">{p.values.error}</div>}
        {p.values.success!==''&& <div className="alert alert-info">{p.values.success}</div>}
        <div className="row g-1 p-1 bg-dark">
        <FieldArray name="items">
        {(arr_h:ArrayHelpers)=>p.values.items.map((item,index,tb)=>
        <Fragment key={index}>
          <div className="col-12 col-md-6">
            <ItemAdder {...{item,index,onToggle,sz:tb.length}} 
              collapse={!toggles[item.id||'']}
              onAddRate={()=>onAddRate(index,p,arr_h)}
              onRemoveRate={(evt:MouseEvent)=>onRemoveRate(evt,index,p,arr_h)}
              onDelete={()=>onDelete(index,item.id||'',arr_h)}
              onDuplicate={()=>onDuplicate(item,index,arr_h)}
            />
          </div>
          {index===tb.length-1 &&
          <div className="col-12">
            <button type="button" className="btn btn-sm btn-success" onClick={()=>onAdd(arr_h)}>+ Nouvel item</button>
          </div>
          }
        </Fragment>
        )}
        </FieldArray>
        </div>
      </Form>
    }
    </Formik>
  }
  </>
  );
}
