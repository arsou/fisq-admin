import{ChangeEvent, ChangeEventHandler, FocusEvent, FocusEventHandler, useRef, useState} from 'react';
import {ErrorMessage, FieldProps} from 'formik';
import { getRandom } from '../../utils/util';


export type MyOption={value:string|number,title:string, disabled?:boolean};
export type MyInputProps={
    onChange?:ChangeEventHandler,
    onBlur?:FocusEventHandler,
    label?:string,
    floating_label?:boolean,
    options?:MyOption[]
};

const Input=(type?:string)=>{
    const M=(props:FieldProps&MyInputProps)=>{
        const {field:{name},form,options,label,floating_label,...rest}={floating_label:true,...props};
        const ref=useRef<any>(null);
        const [state,setState]=useState({value:props.field.value});
        
        const onBlur=async (evt:FocusEvent)=>{
            const errors=await props.form.validateForm();
            const is_valid=!errors[name] || (errors[name]||'').toString().trim()==='';
            ref.current.classList.remove('is-valid','is-invalid');
            ref.current.classList.add(is_valid?'is-valid':'is-invalid');
            props.field.onBlur(evt);
            if(props.onBlur) props.onBlur(evt);
        }

        const onChange=(evt:ChangeEvent)=>{
            const tg=evt.currentTarget as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement;
            if(type==='checkbox')setState({value:(tg as HTMLInputElement).checked})
            else setState({value:tg.value});
            props.field.onChange(evt);
            if(props.onChange)props.onChange(evt)
        }

        const renderInput=()=>{
            const {value}=state;
            const id=`input-${getRandom()}`;
            switch(type?.toLowerCase()){
                case 'textarea':
                    return(<>
                        {!floating_label&&<label htmlFor={id}>{label}</label>}
                         <textarea className="form-control" id={id}
                            {...props.field} {...rest} 
                            {...{ref,onBlur,onChange}}/>
                        {floating_label&&<label htmlFor={id}>{props.form.errors[name]||label}</label>}
                    </>)
                case 'select':
                    return (<>
                        {!floating_label && label &&<label htmlFor={id}>{label}</label>}
                        <select {...props.field} {...rest} id={id}
                        className="form-select form-select-sm" 
                        {...{ref,onBlur,value,onChange}}>
                        {(options||[]).map(({value,title,disabled},i)=>
                            <option key={i} {...{value,disabled}}>{title}</option>
                        )}
                        </select>
                        {floating_label&& label&&<label htmlFor={id}>{props.form.errors[name]||label}</label>}
                    </>)
                case 'range':
                    return(<>
                        {label &&<label htmlFor={id}>{label}</label>}
                        <input id={id} type="range" placeholder={label} className="form-range"
                            {...props.field} 
                            {...rest} 
                            {...{ref,onBlur,onChange}}/>
                    </>)
                case 'checkbox':
                    return( 
                    <div className="form-check">
                        <input id={id} type="checkbox" 
                            className="form-check-input" 
                            checked={!!value}
                            {...props.field} 
                            {...rest} 
                            {...{ref,onBlur,onChange}} />
                        <label htmlFor={id} className="form-check-label">{label}</label>
                    </div>
                    )
                default:
                    return(<>
                    {!floating_label&&<label htmlFor={id}>{label}</label>}
                    <input id={id} type={type||'text'} placeholder={label} 
                        className="form-control form-control-sm "
                        {...props.field} 
                        {...rest} 
                        {...{ref,onBlur,onChange}}/>
                    {floating_label&&<label htmlFor={id}>{props.form.errors[name]||label}</label>}
                    </>)
            }
        }
        
        switch((type||'').toLowerCase()){
            case 'checkbox': 
            case 'range': return renderInput();
            default:
                if(floating_label && label)
                    return(
                    <div className="form-floating">
                        {renderInput()}
                        <div className="invalid-feedback text-right"><ErrorMessage {...{name}}/></div>
                    </div>)
                else
                return(
                <>
                    {renderInput()}
                    <div className="invalid-feedback text-right"><ErrorMessage {...{name}}/></div>
                </>)
        }
    }
    return M;
}

export const MyFieldInput=Input();
export const MyFieldText=Input('text');
export const MyFieldCheckbox=Input('checkbox');
export const MyFieldPassword=Input('password');
export const MyFieldNumber=Input('number');
export const MyFieldRange=Input('range');
export const MyFieldDate=Input('date');
export const MyFieldDateTime=Input('datetime-local');
export const MyFieldSelect=Input('select');
export const MyFieldTextArea=Input('textarea');