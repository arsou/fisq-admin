import { Formik, Form, Field, FormikHelpers, FormikProps} from "formik";
import { useContext } from "react";
import Axios from "axios";
import * as Yup from 'yup';
import { Configuration as ConfigType } from "../../models/configuration";
import {MyFieldDate, MyFieldText,MyFieldTextArea,MyFieldNumber} from "../form-input/input";

import { ApiError } from "../utilitaire/api-error";
import { Loading } from "../utilitaire/loading";
import { Dummy } from "../utilitaire/dummy";

import { AppContext } from "../app-context";
import { Session } from "../../utils/session";
import {config} from "../../config";

const api = config.API;
const DATA_TYPE = "config";

const get_headers = (session: Session) => ({
  Accept: "application/json", "Content-Type": "application/json",
  "x-access-token": session.token, "x-session-id": session.session_id
});

export type FormValue = {
  items: ConfigType[];
  old_items?: ConfigType[];
  error: string;
  success: string;
};

const validationSchema = Yup.array().of(ConfigType.validationSchema);

const initialValues = {items: [ConfigType.create()], error:"", success:""};

export const Configuration = () => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager(DATA_TYPE);
  const session = ctx.sessionManager.getSession();
  const headers = get_headers(session);

  const onCancel = (p: FormikProps<FormValue>) => {
    if(p.values.old_items)
    p.setValues({ ...p.values, items:[...p.values.old_items] });
  };

  const onSubmit = async (value: FormValue,formikHelper: FormikHelpers<FormValue>)=>{
    const body = { data: value.items[0] };
    try {
      formikHelper.setSubmitting(true);
      const r = await Axios.post(`${api}/${DATA_TYPE}/update`, body,{headers});
      if(r.data.error) {
        formikHelper.setValues({ ...value, error:r.data.message, success:"" });
      } 
      else {
        const [old_items,success,error]=[[r.data],"Mise à jour complétée",""];
        mngr.setItems([r.data],false);
        ctx.sessionManager.fromResponse(r.headers);
        formikHelper.setValues({ ...value, old_items, success, error});
      }
    }
    catch (err) {console.log(err)}
    finally{formikHelper.setSubmitting(false)}
  };

  return (
    <>
      {session.is_logged && (
        <Formik {...{initialValues, validationSchema, onSubmit, validateOnBlur: true, validateOnMount: true}}>
          {(p: FormikProps<FormValue>) => (
            <Form className="needs-validation bg-dark px-2 pb-4" noValidate={true}>
              <div className="text-end">
                <div className="text-start text-white fs-5">Configuration</div>
                <Dummy data_type={DATA_TYPE}/>
                <Loading data_type={DATA_TYPE} />
                <ApiError success={p.values.success} error={p.values.error} />

                <div className="btn-group">
                  <button className="btn btn-sm btn-success" type="submit" disabled={p.isSubmitting || !p.isValid}>
                    <span className="material-icons fs-4 text">save</span>Enregistrer
                  </button>
                  <button className="btn btn-sm btn-danger"title="annuler"  
                    disabled={!p.values.old_items} onClick={()=>onCancel(p)}>
                    <span className="material-icons">close</span>Annuler
                  </button>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <Field label="date de début" name="items.0.start_date" component={MyFieldDate} />
                </div>
                <div className="col-12 col-md-6">
                  <Field label="date de fin" name="items.0.end_date" component={MyFieldDate} />
                </div>
                <div className="col-12 col-md-3">
                  <Field label="# d'édition" name="items.0.edition_number" component={MyFieldNumber}/>
                </div>
                <div className="col-12 col-md-3">
                  <Field label="% frais(paypal)" name="items.0.shop_tax" component={MyFieldNumber}/>
                </div>
                <div className="col-12 col-md-6">
                  <Field label="page fb" name="items.0.fb_url" component={MyFieldText}/>
                </div>
                <div className="col-12 col-md-6">
                  <Field label="titre fr" name="items.0.title_fr" component={MyFieldText}/>
                </div>
                <div className="col-12 col-md-6">
                  <Field label="titre en" name="items.0.title_en" component={MyFieldText}/>
                </div>
                <div className="col-12 col-md-6">
                  <Field label="description fr" style={{height:300}} name="items.0.description_fr" component={MyFieldTextArea}/>
                </div>
                <div className="col-12 col-md-6">
                  <Field label="description en" style={{height:300}} name="items.0.description_en" component={MyFieldTextArea}/>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
