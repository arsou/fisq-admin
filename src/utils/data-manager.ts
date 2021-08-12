import { Item } from "../models/item";
import { Manager } from "./manager";
import {config} from "../config";

const SESSION_NAME = [config.SITE_CODE, "session"].join("-");

export type DataManagerEvent='loaded'|'loading';
export class DataManager extends Manager {
  private _dispatcher?: () => void;
  private _sorter?: (a: Item, b: Item) => number;
  private _events:Map<DataManagerEvent,Array<()=>void>>=new Map();
  
  constructor(key: string) {
    super(SESSION_NAME + "-" + key);
  }

  
  private save(items: Item[]) {
    localStorage.setItem(this._key, JSON.stringify(items));
  }

  subscribe(type:DataManagerEvent,fct:()=>void):[DataManagerEvent,number]{    
    if(!this._events.has(type)) this._events.set(type,[]);
    const tb=this._events.get(type) as Array<()=>void>;
    tb.push(fct);
    return [type,tb.length-1];
  }

  unscribe(t:[DataManagerEvent,number]){
    const tab=this._events.get(t[0])||[];
    if(tab.length>t[1]) tab.splice(t[1],1)
  }
  

  trigger(type:DataManagerEvent){
    const tab=this._events.get(type)||[];
    for (const fct of tab)fct();
  }

  load() {
    try {
      const v = localStorage.getItem(this._key);
      if (!v) return null;
      return JSON.parse(v);
    } catch {
      return null;
    }
  }

  

  setDispatcher(dispatcher: () => void) {
    this._dispatcher = dispatcher;
  }

  initEvents(): [string, any][] {
    const fct = (ev: StorageEvent) => {
      if (ev.key === this._key && this._dispatcher) {
        this._dispatcher();
      }
    };
    window.addEventListener("storage", fct);

    return [["storage", fct]];
  }

  clearEvents(evts: [string, any][]) {
    evts.forEach(([evt, fct]) => window.removeEventListener(evt, fct));
  }

  setSorter(sorter: (a: Item, b: Item) => number) {
    this._sorter = sorter;
  }

  getItem(): Item | null {
    const tb = this.load();
    return tb?.length ? tb[0] : null;
  }

  getItems(): Item[] {
    return this.load() || [];
  }

  setItem(item: Item, dispatch: boolean = true) {
    this.setItems([item], dispatch);
  }

  setItems(items: Item[], dispatch: boolean = true) {
    this.save(items);
    if (this._dispatcher && dispatch) this._dispatcher();
  }

  clear() {
    localStorage.removeItem(this._key);
  }

  add(items_to_add: Item[], dispatch: boolean = true) {
    const items = this.getItems().concat(items_to_add);
    if (this._sorter) items.sort(this._sorter);
    this.setItems(items, dispatch);
  }

  update(item_to_update: Item, dispatch: boolean = true) {
    const id = item_to_update.id;
    const items = this.getItems();
    if (!id) {
      if (!items.length) return;
      items[0] = item_to_update;
    } else {
      const index = items.findIndex((it) => it.id === id);
      if (index >= 0) {
        items[index] = item_to_update;
        if (this._sorter) items.sort(this._sorter);
      }
    }
    this.setItems(items, dispatch);
  }

  remove(ids?: string[], dispatch: boolean = true) {
    if(ids && !ids.length) return;
    let items = this.getItems();
    if (!ids && items.length === 1 && items[0].id === undefined) items = [];
    else items = items.filter((it) => !(ids || []).includes(it.id || ""));

    this.setItems(items, dispatch);
  }
}
