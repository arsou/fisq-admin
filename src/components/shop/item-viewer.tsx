import { MouseEventHandler } from "react";
import DomPurify from "dompurify";
import {ShopItem} from "../../models/shop";
import {formatDate} from '../../utils/util';

const fmt='{day_num} {month} {year}';

type ItemViewerProps={
  item: ShopItem,
  collapse:boolean,
  onToggle:MouseEventHandler,
  onEdit:MouseEventHandler,
  onDelete:MouseEventHandler
}
export const ItemViewer=(props:ItemViewerProps)=>{
  const {id,is_active,no_tiket_door,type,title_fr,title_en,
         description_fr,description_en,rates}=props.item;
  const {onToggle,onEdit,onDelete}=props;  
  const collapse=props.collapse?'collapse':'';

  const [active,door,it_type]=[is_active?'oui':'non',
    no_tiket_door?'non':'oui', type==='night'?'soirée':type];
  
  const col=type==='pass'?'primary':(type==='workshop'?'success':'warning');
  const desc_fr=DomPurify.sanitize(description_fr.replace(/\n/g,'<br/>'));
  const desc_en=DomPurify.sanitize(description_en.replace(/\n/g,'<br/>'));
  return (
  <div className={"border border-"+col}>
    <div className={`row bg-${col} mx-0 justify-content-between align-items-center`}>
      <div className={`col-8 lh-1 text-start  btn btn-sm btn-${col} rounded-0`} data-id={id} 
        data-bs-toggle="collapse" data-bs-target={'#key-'+id} onClick={onToggle}>
        {title_fr}<br/>
        <span style={{fontSize:'.75rem'}} className="fw-bold">{title_en}</span>
      </div>
      <button type="button" className="col btn btn-sm btn-info rounded-0" onClick={onEdit}>
        <span className="material-icons">edit</span>Éditer
      </button>
      <button type="button" className="col btn btn-sm btn-danger rounded-0" onClick={onDelete}>
        <span className="material-icons">delete_forever</span>Supprimer
      </button>
    </div>

    <div id={'key-'+id} className={`${collapse} fs-6 bg-white text-start row mx-0 g-1 p-1`}>
      <div className="col-3">actif:<span className="fw-bold">{active}</span></div>
      <div className="col-3">vente à la porte:<span className="fw-bold">{door}</span></div>
      <div className="col-3">type:<span className="fw-bold">{it_type}</span></div>
      <div className="col-12">
        <span className="fw-bold">description fr</span>
        <div dangerouslySetInnerHTML={{__html:desc_fr}}/>
      </div> 
      <div className="col-12">
        <span className="fw-bold">description en</span>
        <div dangerouslySetInnerHTML={{__html:desc_en}}/>
      </div>

      <table className="table table-dark table-striped caption-top">
        <caption className="fw-bold">Tarifs:</caption>
        <thead>
          <tr><th scope="col">montant</th><th scope="col">date</th></tr>
        </thead>
        <tbody>
          {rates.map((r,i)=>
          <tr key={i}>
            <th scope="row">{r.amount}$</th>
            <th>{r.date===''?'':formatDate(r.date,fmt)}</th>
          </tr>
          )}
        </tbody>
      </table>        
    </div>
  </div>
)};