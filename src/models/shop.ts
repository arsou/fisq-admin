import {getRandom} from "../utils/util";
import {Item} from './item';
import * as Yup from 'yup';
import {config} from "../config";

const {SITE_CODE}=config;

export type ShopItemRate={amount:number,date:string};
export type ShopItemKind='pass'|'night'|'workshop';
export class ShopItem extends Item{
  is_active:1|0=1;
  soldout:boolean=false;
  no_tiket_door:boolean=false;
  type:ShopItemKind='pass';
  title_fr:string='titre';
  title_en:string='title';
  description_fr:string='';
  description_en:string='';
  rates:ShopItemRate[]=[{amount:0,date:''}];

  protected constructor(id:string=''){super(id);}
  
  static create():ShopItem{return new ShopItem(SITE_CODE+'-'+getRandom());}
  
  static duplicate(it:ShopItem):ShopItem{
    const id=this.create().id;
    return {...it,id} as ShopItem;
  }

  static clone(it:ShopItem):ShopItem{
    return {...it} as ShopItem;
  }

  static readonly validationSchema=Yup.object().shape({
    is_active:Yup.number().oneOf([1,0],'valeur 0 ou 1').default(1),
    type:Yup.string().oneOf(['pass','night','workshop',"'pass' , 'night' ou 'workshop' pour ce champs"]).required('champ requis *'),
    title_fr:Yup.string().required('champ requis *'),
    title_en:Yup.string().required('champ requis *'),
    description_fr:Yup.string().required('champ requis *'),
    description_en:Yup.string().required('champ requis *'),
    rates:Yup.array().of(
      Yup.object().shape({
        amount:Yup.number().positive('le montant doit être positif *').required('valeur positive requise *')
      })
    )
  });
}