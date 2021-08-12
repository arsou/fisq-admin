import { Formik, Form, Field, FormikHelpers, FormikProps } from "formik";
import { useContext } from "react";
import Axios from "axios";
import * as Yup from "yup";
import { MyFieldTextArea } from "../form-input/input";
import { AppContext } from "../app-context";
import { Session } from "../../utils/session";
import { Item } from "../../models/item";
import { ApiError } from "../utilitaire/api-error";
import { Loading } from "../utilitaire/loading";
import { Dummy } from "../utilitaire/dummy";
import {config} from "../../config";

const get_headers = (session: Session) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  "x-access-token": session.token,
  "x-session-id": session.session_id
});

const api = config.API;

export const DATA_TYPE = "about_us";

export class AboutType extends Item {
  fr: string = "";
  en: string = "";
}

type FormValue = {
  items: AboutType[];
  old_items?: AboutType[];
  error: string;
  success: string
};

const validationSchema = Yup.object().shape({
  items: Yup.array().of(
    Yup.object().shape({
      fr: Yup.string().required("champ requis *"),
      en: Yup.string().required("champ requis *")
    })
  )
});

const initialValues: FormValue = { 
  items: [{ fr:"", en:""}],
  error: "", 
  success: ""
};

export const AboutUs = () => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager(DATA_TYPE);
  const session = ctx.sessionManager.getSession();
  const headers = get_headers(session);

  const onCancel = (p: FormikProps<FormValue>) => {
    if(p.values.old_items)
    p.setValues({ ...p.values, items: [...p.values.old_items] });
  };


  const onSubmit = async (value: FormValue,formikHelper: FormikHelpers<FormValue>) => {
    const body = { data: value.items[0] };
    try {
      formikHelper.setSubmitting(true);
      const r = await Axios.post(`${api}/${DATA_TYPE}/update`, body,{headers});
      if (r.data.error) {
        formikHelper.setValues({ ...value, error:r.data.message, success:"" });
      } 
      else {
        const [old_items,success,error]=[[r.data],"Mise à jour complétée",""];
        mngr.setItem(r.data, false);
        ctx.sessionManager.fromResponse(r.headers);
        formikHelper.setValues({ ...value,old_items,success, error});
      }
    } 
    catch (err){console.log(err)} 
    finally{formikHelper.setSubmitting(false)}
  };

  return (
    <>
    {session.is_logged && 
      <Formik {...{initialValues, validationSchema, onSubmit, validateOnBlur: true, validateOnMount: true}}>
      {(p: FormikProps<FormValue>) => (
        <Form className="needs-validation bg-dark px-2 pb-4" noValidate={true}>
          <div className="text-start text-white fs-5">À propos de nous</div>
          <Dummy data_type={DATA_TYPE}/>
          <Loading data_type={DATA_TYPE}/>
          <ApiError success={p.values.success} error={p.values.error} />

          <div className="text-end">
            <div className="btn-group">
              <button className="btn btn-sm btn-success" type="submit" disabled={p.isSubmitting || !p.isValid}>
                <span className="material-icons fs-4 text">save</span>Enregistrer
              </button>
              <button className="btn btn-sm btn-danger" title="annuler" 
                disabled={!p.values.old_items} onClick={()=>onCancel(p)}>
                <span className="material-icons">close</span>Annuler
              </button>
            </div>
          </div>
          <div className="row mt-2 mx-0">
            <div className="col-12 col-md-6 p-1">
              <Field label="Français" style={{height:300}} name="items.0.fr" component={MyFieldTextArea}/>
            </div>
            <div className="col-12 col-md-6 p-1">
              <Field label="Anglais" style={{height:300}} name="items.0.en" component={MyFieldTextArea}/>
            </div>
          </div>
        </Form>
      )}
      </Formik>
    }
    </>
  );
};
