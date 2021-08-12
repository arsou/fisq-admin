
import {MouseEvent, MouseEventHandler, useState } from "react";
import {Field} from "formik";
import {MyFieldCheckbox, MyFieldDateTime, MyFieldNumber, MyFieldSelect, MyFieldText, MyFieldTextArea} from "../form-input/input";
import {ShopItem} from "../../models/shop";

type ItemEditorProps={
  item:ShopItem,
  index:number, 
  sz:number,
  collapse:boolean,
  onAddRate:MouseEventHandler,
  onRemoveRate:MouseEventHandler,
  onToggle:MouseEventHandler,
  onDelete:MouseEventHandler,
  onDuplicate:MouseEventHandler
}
export const ItemAdder=(props:ItemEditorProps)=>{

  const [state,setState]=useState({
    title_fr:props.item.title_fr,
    title_en:props.item.title_en
  });

  const onChange=(evt:MouseEvent<HTMLInputElement>)=>{
    const lang=evt.currentTarget.dataset.lang as string;
    const v=evt.currentTarget.value;
    if(lang==='fr') setState({...state,title_fr:v});
    else setState({...state,title_en:v});
  }

  const opt_type=[
    {value:'pass',title:'pass'},
    {value:'workshop',title:'atelier'},
    {value:'night',title:'soirée'}
  ];
  const {item:{id},index,onToggle,onAddRate,onRemoveRate,onDelete,onDuplicate}=props;
  const collapse=props.collapse?'collapse':'';
  const rates_sz=props.item.rates.length;
  return (
  <div className="border border-warning">
    <div className="row bg-warning mx-0 justify-content-between align-items-center">
      <div className="col-10 lh-1 text-start  btn btn-sm btn-danger rounded-0" data-id={id} 
        data-bs-toggle="collapse" data-bs-target={'#key-'+id} onClick={onToggle}>
        {state.title_fr}<br/>
        <span style={{fontSize:'.75rem'}} className="fw-bold">{state.title_en}</span>
      </div>
      <button type="button" className="col btn btn-sm btn-primary rounded-0" title="Dupliquer" onClick={onDuplicate}>
        <span className="material-icons">content_copy</span>
      </button>
      {props.sz>1 &&
      <button type="button" className="col btn btn-sm btn-danger rounded-0" title="Annuler" onClick={onDelete}>
        <span className="material-icons">close</span>
      </button>}
    </div>  
    <div id={'key-'+id} className={`${collapse} row mx-0 g-1 p-1 bg-white justify-content-between align-items-center`}>
      <div className="col-3">
        <Field label="actif" name={`items.${index}.is_active`} component={MyFieldCheckbox}/>
      </div>
      <div className="col-3">
        <Field label="soldout" name={`items.${index}.soldout`} component={MyFieldCheckbox}/>
      </div>
      <div className="col-3">
        <Field label="no ticket at door" name={`items.${index}.no_tiket_door`} component={MyFieldCheckbox}/>
      </div>
      <div className="col-3">
        <Field label="type" name={`items.${index}.type`} options={opt_type} component={MyFieldSelect}/>
      </div>
      <div className="col-12 col-md-6">
        <Field label="titre fr" name={`items.${index}.title_fr`} data-lang="fr"
          value={state.title_fr} {...{onChange}} component={MyFieldText}/>
      </div>
      <div className="col-12 col-md-6">
        <Field label="titre en" name={`items.${index}.title_en`} data-lang="en"
          value={state.title_en} {...{onChange}} component={MyFieldText}/>
      </div>
      <div className="col-12">
        <Field label="description fr" name={`items.${index}.description_fr`} component={MyFieldTextArea}/>
      </div>
      <div className="col-12">
        <Field label="description en" name={`items.${index}.description_en`} component={MyFieldTextArea}/>
      </div>
      <table className="table table-sm  table-dark caption-top align-middle">
        <caption>Tarifs:</caption>
        <thead>
          <tr>
            <th scope="col" className="col-5">Montants</th>
            <th scope="col" className="col-5">Dates</th>
            <th scope="col" className="col"></th>
          </tr>
        </thead>
        <tbody>
          {props.item.rates.map((r,j)=>
          <tr key={j}>
            <th scope="row">
            <Field name={`items.${index}.rates.${j}.amount`} component={MyFieldNumber}/>
            </th>
            <th>
            <Field name={`items.${index}.rates.${j}.date`} component={MyFieldDateTime}/>
            </th>
            <th>
            {rates_sz>1 &&
              <span className="material-icons btn btn-sm btn-danger" data-rate_index={j}
                onClick={onRemoveRate}>
                disabled_by_default
              </span>
            }
            </th>
          </tr>  
          )}
          <tr>
            <td colSpan={3}>
              <button type="button" className="btn btn-sm btn-primary" onClick={onAddRate}>
                Ajouter un tarif
              </button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
  )
}