import moment from "moment-timezone";
import {Manager} from './manager';
import {config} from "../config";

export type Session={
    session_id:string,user:string, email:string, expire:number, 
    token:string, is_logged:boolean
};

export const EMPTY_SESSION:Session={
    session_id:'',token:'',email:'',expire:0,user:'',is_logged:false
};

const SESSION_NAME=[config.SITE_CODE,'session'].join('-');
const {TIMEZONE}=config;
const localStorage=window.localStorage;

type SessionDispatcher=(s:Session)=>void;

export class SessionManager extends Manager{
    private _dispatcher:SessionDispatcher|null=null;
    private _session:Session=EMPTY_SESSION;
    private static _instance:SessionManager;
    
    protected constructor(){
        super(SESSION_NAME);
        this._session=SessionManager.load();
    }

    protected static save(session:Session){
        localStorage.setItem(SESSION_NAME,JSON.stringify(session));        
    }
    
    static instance(disp?:SessionDispatcher):SessionManager{
        if(!this._instance) this._instance=new SessionManager();
        if(disp && !this._instance._dispatcher)this._instance._dispatcher=disp;
        return this._instance;
    }

    protected static equals(s1: Session,s2: Session){
        return s1.token===s2.token && s1.expire===s2.expire &&
               s1.is_logged===s2.is_logged;
    }

    protected static load():Session{
        const now=moment().tz(TIMEZONE).unix();        
        let sess:Session={...EMPTY_SESSION};
        try{
            const str=localStorage.getItem(SESSION_NAME)||'';
            const s=JSON.parse(str) as Session;
            if(s && now<s.expire)sess=s;
        }
        catch{} 
        finally{return sess;}
    } 

    initEvents():[string,any][]{
        const fct=(ev:StorageEvent)=>{
            if(ev.key===this._key && this._dispatcher) 
            this._dispatcher(this.getSession())
        }
        window.addEventListener('storage',fct);

        return [['storage',fct]];
    }

    clearEvents(evts:[string,any][]){
        evts.forEach(([evt,fct])=>window.removeEventListener(evt,fct))
    }

    setDispatcher(dispatcher:SessionDispatcher){
        this._dispatcher=dispatcher;
    }

    getSession():Session{
        //const temp=this._session;
        this._session=SessionManager.load();
        
        //if(!SessionManager.equals(temp,this._session)) 
        //SessionManager.save(this._session)
        
        return this._session;
    }

    set(sess:Session){
        this._session=sess;
        SessionManager.save(sess);
        if(this._dispatcher) this._dispatcher(sess);
    }

    clear(){
        const s={...EMPTY_SESSION};
        this._session=s;
        SessionManager.save(this._session);
        if(this._dispatcher) this._dispatcher(s);
    }

    fromResponse(obj:{[k:string]:string|number|boolean}){
        if(obj['x-session-id'])this._session.session_id=<string>obj['x-session-id'];
        if(obj['x-access-token']) this._session.token=<string>obj['x-access-token'];
        if(obj['x-expire'])this._session.expire=parseInt(<string>obj['x-expire'],10);
        this._session.is_logged=this._session.token!=='' && 
                                !obj.login_error && 
                                this._session.expire>moment().tz(TIMEZONE).unix();
        
        if(obj.user) this._session.user=obj.user as string; 
        if(obj.email) this._session.email=obj.email as string; 
        if(!this._session.is_logged) this._session={...EMPTY_SESSION};
        SessionManager.save(this._session);
        if(this._dispatcher) this._dispatcher(this._session);
    }
}
