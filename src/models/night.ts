import {getRandom} from "../utils/util";
import {Item} from './item';
import * as Yup from 'yup';

export class Night extends Item{
  is_active:1|0=1;
  title_fr:string='titre';
  title_en:string='title';
  description_fr:string='';
  description_en:string='';
  date:string='';

  protected constructor(id:string=''){super(id);}
  
  static create():Night{return new Night('night-'+getRandom());}
  
  static duplicate(n:Night):Night{
    const id=this.create().id;
    return {...n,id} as Night;
  }

  static clone(night:Night):Night{
    return {...night} as Night;
  }

  static readonly validationSchema=Yup.object().shape({
    is_active:Yup.number().oneOf([1,0],'valeur 0 ou 1').default(1),
    title_fr:Yup.string().required('champ requis *'),
    title_en:Yup.string().required('champ requis *'),
    description_fr:Yup.string().required('champ requis *'),
    description_en:Yup.string().required('champ requis *'),
    date:Yup.string().required('champ requis *')
  });
}