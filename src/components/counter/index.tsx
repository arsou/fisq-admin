import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../app-context";
import moment from "moment";
import {config} from "../../config";

const {TIMEZONE}=config;

export type CounterProps={onEnd?:()=>any}
export const Counter=(props:CounterProps)=>{

  const ctx=useContext(AppContext);
  const ctnRef=useRef<HTMLSpanElement>(null);
  
  useEffect(()=>{
    let hdler=0;
    hdler=window.setInterval(()=>{
      const {expire}=ctx.sessionManager.getSession();
      const tm=Math.max(expire-moment.tz(TIMEZONE).unix(),0);
      const [m1,m2]=[Math.trunc(tm/60),tm%60];
      const str=`0${m1}`.slice(-2)+':'+`0${m2}`.slice(-2);
      (ctnRef.current as HTMLSpanElement).innerHTML=str;
      if(!tm){
        if(hdler){ clearInterval(hdler); hdler=0; }
        if(props.onEnd) props.onEnd();
      } 
    },2000);
    return ()=>window.clearInterval(hdler)
  },[]);

  return <span ref={ctnRef}/>;
}