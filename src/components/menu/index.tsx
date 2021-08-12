import { useContext, useRef } from "react";
import {Link,useLocation} from "react-router-dom";
import { getRandom } from "../../utils/util";
import { AppContext } from "../app-context";
import { Counter } from "../counter";

const menus=[
  {title:'Configuartion', link:'/configuration'},
  {title:"Images d'accueil", link:'/fp_artists'},
  {title:'Boutique', link:'/shop'},
  {title:'Soirées', link:'/nights'},
  {title:'Ateliers', link:'/workshops'},
  {title:'Artistes', link:'/artists'},
  {title:'A propos du Fisq', link:'/about_us'}
];

export const Menu=()=>{

  const location=useLocation();
  const ctx=useContext(AppContext);
  const session=ctx.sessionManager.getSession();
  const refLogout=useRef<HTMLButtonElement>(null); 
  
  const onDisconnect=()=>{
    const btn=refLogout.current as HTMLButtonElement;
    btn.disabled=true;
    ctx.logout().finally(()=>btn.disabled=false)
  }

  const hover=(i:number)=>{
    const active='border-bottom border-primary border-3 fw-bold';
    if(!i && location.pathname==='/') return active;
    return `${location.pathname}`.startsWith(menus[i].link)?active:'';
  }

  const id='navbar-'+getRandom();
  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target={"#"+id}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id={id}>
          <ul className="navbar-nav">
          {menus.map(({title,link},i)=>
            <li key={i} className={`nav-item ${hover(i)}`}>
              <Link className="nav-link" to={link}>
                {title}
              </Link>
            </li>
          )}
          </ul>
          {session.is_logged &&
          <div className="btn-group p-1">
            <button className="btn btn-primary btn-sm disabled">{session.user}</button>
            <button className="btn btn-primary btn-sm disabled"><Counter onEnd={onDisconnect}/></button>
            <button ref={refLogout} className="btn btn-primary btn-sm" onClick={onDisconnect}>
              Déconnecter
            </button>
          </div>
          }
        </div>
      </div>
    </nav>
  )
}