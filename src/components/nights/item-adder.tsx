import { Field } from "formik";
import { MouseEvent, MouseEventHandler, useState } from "react";
import { Night } from "../../models/night";
import {
  MyFieldDate,
  MyFieldSelect,
  MyFieldText,
  MyFieldTextArea
} from "../form-input/input";

type ItemAdderProps = {
  night: Night;
  i: number;
  sz: number;
  collapse: boolean;
  onToggle: MouseEventHandler;
  onDelete: MouseEventHandler;
  onDuplicate: MouseEventHandler;
};

export const ItemAdder = (props: ItemAdderProps) => {
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
  const collapse = props.collapse ? "collapse" : "";
  const {
    night: { id },
    i
  } = props;

  return (
    <div className="border border-warning">
      <div className="row bg-warning mx-0 justify-content-between align-items-center">
        <div
          className="col-10 lh-1 text-start btn btn-sm btn-warning"
          data-id={id}
          data-bs-toggle="collapse"
          data-bs-target={"#key-" + id}
          onClick={props.onToggle}
        >
          {state.title_fr} [id:{id}]<br />
          <span style={{ fontSize: ".75rem" }}>{state.title_en}</span>
        </div>
        <div className="btn-group btn-group-sm col-2">
          <button
            type="button"
            className="btn btn-primary"
            title="Dupliquer"
            onClick={props.onDuplicate}
          >
            <span className="material-icons">content_copy</span>
          </button>
          {props.sz > 1 && (
            <button
              type="button"
              className="btn btn-danger"
              title="Annuler"
              onClick={props.onDelete}
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>

      <div id={"key-" + id} className={`${collapse} row g-1`}>
        <div className="col-6">
          <Field
            label="date"
            name={`items.${i}.date`}
            component={MyFieldDate}
          />
        </div>
        <div className="col-6">
          <Field
            label="État"
            name={`items.${i}.is_active`}
            options={opt_state}
            component={MyFieldSelect}
          />
        </div>
        <div className="col-12 col-md-6">
          <Field
            label="titre fr"
            name={`items.${i}.title_fr`}
            data-lang="fr"
            value={state.title_fr}
            {...{ onChange }}
            component={MyFieldText}
          />
        </div>
        <div className="col-12 col-md-6">
          <Field
            label="titre en"
            name={`items.${i}.title_en`}
            data-lang="en"
            value={state.title_en}
            {...{ onChange }}
            component={MyFieldText}
          />
        </div>
        <div className="col-12">
          <Field
            label="description fr"
            name={`items.${i}.description_fr`}
            component={MyFieldTextArea}
          />
        </div>
        <div className="col-12">
          <Field
            label="description en"
            name={`items.${i}.description_en`}
            component={MyFieldTextArea}
          />
        </div>
      </div>
    </div>
  );
};
