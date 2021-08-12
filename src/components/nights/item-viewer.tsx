import { MouseEventHandler } from "react";
import DomPurify from "dompurify";
import {Night} from "../../models/night";
import {formatDate} from '../../utils/util';

const fmt='{day_num} {month} {year}';

type ItemViewerProps={
  night: Night,
  collapse:boolean,
  onToggle:MouseEventHandler,
  onEdit:MouseEventHandler,
  onDelete:MouseEventHandler
}
export const ItemViewer=(props:ItemViewerProps)=>{
  const {id,date,is_active,title_fr,title_en,description_fr,description_en}=props.night;
  const {onToggle,onEdit,onDelete}=props;  
  const collapse=props.collapse?'collapse':'';

  const desc_fr=DomPurify.sanitize(description_fr.replace(/\n/g,'<br/>'));
  const desc_en=DomPurify.sanitize(description_en.replace(/\n/g,'<br/>'));

  return (
  <div className="border border-warning">
    <div className="btn-group btn-group-sm text-start col-12">
      <div className="btn btn-warning rounded-0 text-start col-8" data-id={id}
        data-bs-toggle="collapse" data-bs-target={'#key-'+id} onClick={onToggle}>
        <span>{title_fr}</span>
        <span style={{fontSize:'.75rem'}} className="">({title_en})</span>
      </div>
      <button type="button" className="btn btn-sm btn-success" onClick={onEdit}>
        <span className="material-icons">edit</span>Editer
      </button>
      <button type="button" className="btn btn-sm btn-danger" onClick={onDelete}>
        <span className="material-icons">delete_forever</span>supprimer
      </button>      
    </div>      
    <div id={'key-'+id} className={`${collapse} fs-6 bg-white text-start row mx-0 g-1 p-1`}>
      <div className="col-12">
        {formatDate(date,fmt)} ({is_active?'actif':'inactif'})
      </div>
      <div className="col-12">
        <span className="fw-bold">description fr</span>
        <div dangerouslySetInnerHTML={{__html:desc_fr}}/>
      </div> 
      <div className="col-12">
        <span className="fw-bold">description en</span>
        <div dangerouslySetInnerHTML={{__html:desc_en}}/>
      </div>        
    </div>
  </div>
)};