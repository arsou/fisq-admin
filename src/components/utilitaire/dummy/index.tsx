import { useFormikContext } from "formik";
import { useContext, useEffect } from "react";
import { AppContext } from "../../app-context";

type DummyProps={data_type: string};

export const Dummy = (props:DummyProps) => {
  const { data_type } = props;
  const ctx = useContext(AppContext); 
  const mngr=ctx.getDataManager(data_type);
  const { setValues, values } = useFormikContext<any>();
  
  const init=()=>{
    const items=mngr.getItems();
    if(['config','about_us'].includes(data_type)) 
      setValues({...values,items,old_items:[...items]});
    else setValues({...values,items});
  }
  
  useEffect(()=>{
    const tb=mngr.subscribe('loaded',init);
    return ()=>mngr.unscribe(tb);
  },[]);

  useEffect(()=>init(),[ctx]);

  return <></>;
};
