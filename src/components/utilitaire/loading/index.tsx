import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";

export const Loading = (props: { data_type: string }) => {
  const ctx = useContext(AppContext);
  const mngr = ctx.getDataManager(props.data_type);
  const [show,setShow]=useState('d-none');

  useEffect(()=>{
    const tb1=mngr.subscribe('loading',()=>setShow(''));
    const tb2=mngr.subscribe('loaded',()=>setShow('d-none'));
    return ()=>{
      mngr.unscribe(tb1);
      mngr.unscribe(tb2);
    }
  },[]);

  return (
    <div className={show}>
      <div className="d-grid col-10 mx-auto">
        <button className="btn btn-warning text-center" disabled>
          <span className="spinner-grow spinner-grow-sm" />
          chargement en cours ...{props.data_type}
        </button>
      </div>
    </div>
  );
};
