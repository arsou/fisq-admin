import { createContext, PropsWithChildren, useState, useEffect } from "react";
import moment from "moment";
import { Session, SessionManager } from "../utils/session";
import { DataManager } from "../utils/data-manager";
import Axios from "axios";
import { getRandom} from "../utils/util";
import { Item } from "../models/item";
import {config} from "../config";

const api = config.API;

const get_headers = (session: Session) => ({
  Accept: "application/json", "Content-Type": "application/json",
  "x-access-token": session.token, "x-session-id": session.session_id
});

const  {TIMEZONE}= config;

type MyDispatcher = ((s: Session) => void) | (() => void);

export class ContextValue {
  private _sessionMnger: SessionManager = SessionManager.instance();
  private _dataMnger: Map<string, DataManager> = new Map();

  constructor(mngrs?: Map<string, DataManager>,_disp?: Map<string, MyDispatcher>){
    this._dataMnger = mngrs || new Map();
    const disp = _disp || new Map<string, MyDispatcher>();
    const sess_disp = disp.get("session");

    if (sess_disp) this._sessionMnger.setDispatcher(sess_disp);

    for (let [k, mng] of this._dataMnger) {
      const d = disp.get(k);
      if (d) mng.setDispatcher(d as () => void);
    }
  }

  public get sessionManager() {return this._sessionMnger;}

  addManager(key: string, mngr: DataManager) {this._dataMnger.set(key, mngr);}

  getDataManager(key: string) {return this._dataMnger.get(key) || new DataManager(key);}

  async logout() {
    const session = this._sessionMnger.getSession();
    const {is_logged, expire } = session;
    const tm = Math.max(expire - moment.tz(TIMEZONE).unix(), 0);
    const headers = get_headers(session);
    if (!is_logged && !tm) this._sessionMnger.clear();
    try {
      const r = await Axios.get(`${api}/logout`, { headers });
      if(r?.data.success) this._sessionMnger.clear();
    } catch {}
  }
}

const data_keys = "config,about_us,nights,artists,fp_artists,workshops,shop".split(",");

const data_managers = new Map(data_keys.map((k) => [k, new DataManager(k)]));

const handler = { value: 0 };
const flag={value:false};

export const AppContext = createContext<ContextValue>(new ContextValue());

type IState={session?:Session, num:number};
export const AppContextProvider = (props: PropsWithChildren<{}>) => {
  const [state, setState] = useState<IState>({num: getRandom()});

  const dataDispatcher = () => setState({ ...state, num: getRandom() });
  const sessionDispatcher = (s: Session) => setState({ ...state, session: s });

  const dispatchers = new Map<string, MyDispatcher>();
  dispatchers.set("session", sessionDispatcher);
  data_keys.forEach(k=>dispatchers.set(k,dataDispatcher))
  const ctx = new ContextValue(data_managers, dispatchers);
  
  const clear_data = () => {
    data_managers.forEach((mngr) => mngr.clear());
  };

  const load_data = () => {
    const headers = get_headers(state.session as Session);
    Array.from(data_managers.entries()).forEach(([k, mngr]) => {
      let data = [] as Item[];
      mngr.trigger('loading');
      Axios.get(`${api}/${k}`, { headers })
        .then((r) => (data = Array.isArray(r.data) ? r.data : [r.data]))
        .catch(() => (data = []))
        .finally(() =>{
            mngr.setItems(data,false);     
            mngr.trigger('loaded');       
        });
    });
  };

  useEffect(() => {
    const mngrs = [ctx.sessionManager, ...Array.from(data_managers.values())];
    const tb = mngrs.map(mng=> mng.initEvents());
    const session=ctx.sessionManager.getSession();
    flag.value=true;
    setState(p=> ({ ...p, session}));

    return () => mngrs.forEach((mng, i) => mng.clearEvents(tb[i]));
  }, []);

  useEffect(() => {
    if (state.session && state.session.is_logged) {
      const { expire } = state.session;
      const tm = 1000 * Math.max(expire - moment.tz(TIMEZONE).unix() - 2, 0);
      if (handler.value) window.clearTimeout(handler.value);
      handler.value = window.setTimeout(() => ctx.logout(), tm);
    }
    return () => {
      if (handler.value) {
        window.clearTimeout(handler.value);
        handler.value = 0;
      }
    };
  }, [state.session]);

  
  useEffect(() => {
    if (!state.session) return;
    if (state.session.is_logged && !flag.value){
        load_data();
    }
    else if(!state.session.is_logged){
        flag.value=false;
        clear_data();
    }
  }, [state.session?.is_logged]);


  return (
    <AppContext.Provider value={ctx}>{props.children}</AppContext.Provider>
  );
};
