export abstract class Manager{
  constructor(protected _key:string=''){}
 
  get key(){return this._key}
  
  initEvents():[string,any][]{return [];}

  clearEvents(evts:[string,any][]){}

  isCleared(){return !localStorage.getItem(this._key);}

}