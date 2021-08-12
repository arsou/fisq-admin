import { MouseEvent, MouseEventHandler, useState } from "react";
import { Field } from "formik";
import {MyFieldDate, MyFieldSelect,MyFieldText, MyFieldTextArea} from "../form-input/input";
import { Night } from "../../models/night";

type ItemEditorProps = {
  night: Night;
  index: number;
  collapse: boolean;
  onToggle: MouseEventHandler;
  onUpdate: MouseEventHandler;
  onCancel: MouseEventHandler;
};
export const ItemEditor = (props: ItemEditorProps) => {
  const [state, setState] = useState({
    title_fr: props.night.title_fr,
    title_en: props.night.title_en
  });

  const onChange = (evt: MouseEvent<HTMLInputElement>) => {
    const lang = evt.currentTarget.dataset.lang as string;
    const v = evt.currentTarget.value;
    if (lang === "fr") setState({ ...state, title_fr: v });
    else setState({ ...state, title_en: v });
  };

  const opt_state = [
    { value: 0, title: "inactif" },
    { value: 1, title: "actif" }
  ];
  const {night:{id},index,onToggle, onUpdate,onCancel} = props;
  const collapse = props.collapse ? "collapse" : "";
  return (
    <div className="border border-danger">
      <div className="row bg-danger mx-0 justify-content-between align-items-center">
        <div className="col-10 text-start btn btn-sm btn-danger"
          data-id={id} data-bs-toggle="collapse" data-bs-target={"#key-" + id} onClick={onToggle}
        >
          {state.title_fr}
          <span style={{ fontSize: ".75rem" }}>({state.title_en})</span>
        </div>
        <div className="btn-group btn-group-sm col-2">
          <button type="button" className="btn btn-primary" title="Enregistrer" onClick={onUpdate}>
            <span className="material-icons">save</span>
          </button>
          <button type="button" className="btn btn-warning" title="Annuler" onClick={onCancel}>
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      <div id={"key-" + id} className={`${collapse} row mx-0 g-1 p-1`}>
        <div className="col-6">
          <Field label="date" name={`items.${index}.date`} component={MyFieldDate} />
        </div>
        <div className="col-6">
          <Field label="État" name={`items.${index}.is_active`} options={opt_state} component={MyFieldSelect}/>
        </div>
        <div className="col-12 col-md-6">
          <Field label="titre fr" name={`items.${index}.title_fr`}
            data-lang="fr" value={state.title_fr} {...{ onChange }} component={MyFieldText}/>
        </div>
        <div className="col-12 col-md-6">
          <Field label="titre en" name={`items.${index}.title_en`}
            data-lang="en" value={state.title_en} {...{ onChange }} component={MyFieldText}
          />
        </div>
        <div className="col-12">
          <Field label="description fr" name={`items.${index}.description_fr`} component={MyFieldTextArea}/>
        </div>
        <div className="col-12">
          <Field label="description en" name={`items.${index}.description_en`} component={MyFieldTextArea}/>
        </div>
      </div>
    </div>
  );
};
