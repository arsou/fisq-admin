import { Formik, FormikProps, Form, FieldArray, ArrayHelpers, FormikHelpers} from "formik";
import { MouseEvent, useContext, Fragment } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as Yup from "yup";
import { Night } from "../../models/night";
import { ItemAdder } from "./item-adder";
import { AppContext } from "../app-context";
import {config} from "../../config";

const validationSchema = Yup.object().shape({
  nights: Yup.array().of(Night.validationSchema)
});

const api = config.API;

type FormValue = { items: Night[]; error: string; success: string };

const initialValues:FormValue={items:[Night.create()], error:'', success:''};

const toggles = {} as { [k: string]: boolean };

export const NightAdder = () => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager("nights");
  const session = ctx.sessionManager.getSession();

  const headers = {
    Accept: "application/json","Content-Type": "application/json",
    "x-access-token": session.token, "x-session-id": session.session_id
  };

  const onToggle = (evt: MouseEvent<HTMLDivElement>) => {
    const id = evt.currentTarget.dataset.id as string;
    toggles[id] = !toggles[id];
  };

  const onSubmit = async (value: FormValue,formikHelper: FormikHelpers<FormValue>)=>{
    const body = { nights: value.items };
    try {
      formikHelper.setSubmitting(true);
      const r = await Axios.post(`${api}/nights/add`, body, { headers });
      if (r.data.error)formikHelper.setValues({...value,success: "",error: r.data.message});
      else {
        const [success,error]=['ajout effectué avec success',''];
        mngr.setItems(r.data,false);
        ctx.sessionManager.fromResponse(r.headers);
        formikHelper.setValues({items:[Night.create()],error, success});
      }
    } 
    catch(err){console.log(err)} 
    finally{formikHelper.setSubmitting(false)}
  };

  const onDelete = (i: number, id: string, arr_h: ArrayHelpers) => {
    if (toggles[id]) delete toggles[id];
    arr_h.remove(i);
  };

  const onAdd = (arr_h: ArrayHelpers) => {
    arr_h.push(Night.create());
  };

  const onDuplicate = (it: Night, i: number, arr_h: ArrayHelpers) => {
    const night = Night.duplicate(it);
    night.title_fr += "(copie)";
    night.title_en += "(copy)";
    arr_h.insert(i + 1, night);
  };

  return (
    <>
    {session.is_logged && (
      <Formik {...{initialValues,validationSchema,onSubmit, validateOnBlur: true, validateOnMount: true}}>
      {(p: FormikProps<FormValue>) => (
        <Form className="needs-validation" noValidate={true}>
          <div className="col-12 text-end p-1">
            <div className="btn-group btn-group-sm">
              <Link className="btn btn-sm btn-info" to="/nights">+ Liste des soirées</Link>
              {p.values.items.length > 0 && 
              <button type="submit" className="btn btn-primary" disabled={p.isSubmitting || !p.isValid}>
                Ajouter
              </button>
              }
            </div>
          </div>
          {p.values.error !== "" && 
            <div className="alert alert-danger">{p.values.error}</div>
          }
          {p.values.success !== "" &&
            <div className="alert alert-info">{p.values.success}</div>
          }
          <div className="row g-1 p-1 bg-dark">
          <FieldArray name="nights">
          {(arr_h: ArrayHelpers) =>p.values.items.map((night, i, tb) =>
            <Fragment key={i}>
              <div className="col-12 col-md-6">
                <ItemAdder
                  {...{ night, i, onToggle, sz: tb.length }}
                  collapse={!toggles[night.id || ""]}
                  onDelete={() => onDelete(i, night.id || "", arr_h)}
                  onDuplicate={() => onDuplicate(night, i, arr_h)}
                />
              </div>
              {i === tb.length - 1 &&
              <div className="col-12">
                <button type="button" className="btn btn-sm btn-success" onClick={() => onAdd(arr_h)}>
                  +
                </button>
              </div>
              }
            </Fragment>
          )}
          </FieldArray>
          </div>
        </Form>
      )}
      </Formik>
    )}
    </>
  );
};
