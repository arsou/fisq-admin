import { getRandom } from "../utils/util";
import { Item } from "./item";


export type ArtistImage={name:string,width:number,height:number, url:string};
export type ArtistType='DJ'|'NATIONAL_ARTIST'|'INTERNATIONAL_ARTIST';

export class ArtistItem extends Item{
  is_active:boolean=true;
  type?:ArtistType='NATIONAL_ARTIST';
  image_file?:File;
  images:ArtistImage[]=[];

  protected constructor(id:string=''){super(id);}
  
  static create(prefix:string='artist'):ArtistItem{
    return new ArtistItem([prefix,getRandom()].join('-'));
  }

  static clone(a:ArtistItem):ArtistItem{
    return {...a,images:a.images.map(im=>({...im}))} as ArtistItem
  }
};