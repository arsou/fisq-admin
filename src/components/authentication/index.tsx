import * as React from "react";
import Axios from "axios";
import { AppContext } from "../app-context";
import {GoogleAuthProvider,FacebookAuthProvider,EmailAuthProvider,getAuth,signInWithPopup} from "firebase/auth";
import * as firebase from "firebase/app";
import {config} from "../../config";

const api=config.API;

const trans:{[k:string]:any}={
  en:{
    connection:'Connection',
    sign_with_google:'Sign in with Google',
    sign_with_fb:'Sign in with Facebook',
    sign_with_email:'Sign in with email'
  },
  fr:{
    connection:'Se connecter',
    sign_with_google:'Se Connecter avec Google',
    sign_with_fb:'Se Connecter avec Facebook',
    sign_with_email:"Se connecter avec l'email"
  }
}

const dict=trans.fr;

if(!firebase.getApps().length)
firebase.initializeApp({
  apiKey: "AIzaSyALtaQQCk2ChiBD99SPPv6BLSVgf3t8nXY",
  authDomain: "service-authentification.firebaseapp.com",
  projectId: "service-authentification",
  storageBucket: "service-authentification.appspot.com",
  messagingSenderId: "123386918108",
  appId: "1:123386918108:web:4799052262593ca622b019",
  measurementId: "G-1Y987KV133"
})
else firebase.getApp();


const auth = getAuth();
auth.languageCode='fr';

const providers={
  google:new GoogleAuthProvider(),
  facebook:new FacebookAuthProvider(),
  email: new EmailAuthProvider()
};
providers.google.addScope('email');
providers.facebook.addScope('email');

export type AuthenticationProps={}

export const Authentication=()=>{
  const ctx=React.useContext(AppContext);
  const [state,setState]=React.useState({error:'', dummy:1});

  const refLogout=React.useRef<HTMLButtonElement>(null);
  
  const onSign=async (evt:React.MouseEvent<HTMLButtonElement>)=>{
    const p=(evt.target as HTMLButtonElement).dataset.provider as string; 
    const provider=p==='google'?providers.google:
                  (p==='facebook'?providers.facebook:providers.email);

    let [user,email,token]=['','',''];
    try{
      const r=await signInWithPopup(auth,provider);
      [email,user, token]=[
        r.user.email||'', r.user.displayName||'', await r.user.getIdToken()
      ];
    }
    catch(err){console.log(err)}

    if(token===''){
      setState({...state,error:'connection impossible'});
      return
    }

    const headers={
      'Accept': 'application/json','Content-Type': 'application/json', 
      'x-access-token': token
    };

    try{
      const r= await Axios.post(`${api}/login`,{email},{headers});

      if(r?.data.error){
        setState({...state,error:r.data.message});
      }
      else{
        if(state.error!=='') setState({...state,error:''});
        ctx.sessionManager.fromResponse({...r.headers,email,user});
      }
    }catch(error){
      console.log('axios: ',error)
      setState({...state,error:'Connection impossible'});
    }
  }

  const session=ctx.sessionManager.getSession();
  const show=session.is_logged?'d-none':'';

  return (
  <div className={`position-absolute top-0 start-0 vw-100 vh-100 ${show}`}
      style={{zIndex:999, background:'rgba(0,0,0,.6)'}}>
    <div className="bg-dark text-white p-3 position-absolute col-11 col-md-4 border top-50 start-50 translate-middle">
      <div className="text-center py-2">{dict.connection}</div>
      {state.error!=='' &&
      <div className="alert alert-danger">{state.error}</div>
      }
      <div className="d-grid gap-2">
        <button className="btn btn-danger" data-provider="google" onClick={onSign}>{dict.sign_with_google}</button>
        <button className="btn btn-primary" data-provider="facebook" onClick={onSign}>{dict.sign_with_fb}</button>
        <button className="btn btn-success" data-provider="email" onClick={onSign}>{dict.sign_with_email}</button>
      </div>
    </div>
  </div>
  )
}