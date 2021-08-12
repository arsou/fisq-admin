import { DAYS, DAYS_SHORT, MONTHS, MONTHS_SHORT } from "./constants";

  export function arrayMove<T>(arr:T[],from:number,to:number):T[]{
    const tb=[...arr];
    const iter=from<to?1:-1;
    const item=tb[from];
    for(let i=from;i!==to;i+=iter) tb[i]=tb[i+iter];      
    tb[to]=item;
      
    //tb.splice(to < 0 ? tb.length + to : to, 0, tb.splice(from, 1)[0]);
    return tb;
  }

  export function getRandom(...args:number[]):number{
    let [a1,b1]=[0,0];
    if(!args.length) [a1,b1]=[Math.pow(10,5),Math.pow(10,6)-1];
    else if(args.length>=2)[a1,b1]=args[0]<args[1]?[args[0],args[1]]:[args[1],args[0]];
    else [a1,b1]=[args[0],2<<32-1];
    return Math.ceil(a1+Math.random()*(b1-a1));
  }


  export function formData(obj:{[k:string]:any}):FormData{
    const f= new FormData();
    for(let k in obj) f.append(k,obj[k]);
    return f;
  }

  export function cssClass(obj:{[k:string]:boolean}):string{
    return Object.entries(obj).reduce((p,[k,e])=>e?[...p,k]:p,[] as string[]).join(' ');
  }

  export function exclude(obj:{[k:string]:any},...keys:string[]):{[k:string]:any}{
    const tmp=Object.fromEntries((keys.length===1?keys[0].split(','):keys).map(s=>[s,true]));
    return Object.fromEntries(Object.entries(obj).filter(e=>!tmp[e[0]]));
  }
  /*
    {year}=year
    {day_num} = day number, 
    {day}=day name, 
    {day_short}=day name short, 
    {month_num}= month number
    {month}= long month
    {month_short}=short month
    {time}=time(HH:MM:SS)  
    {hour}=HH   
    {minute}=MM   
    {sec}=MM   
  */
  export function formatDate(date:string|number,format:string):string{
    const dt=new Date(typeof date==='string' && date===''? Date.now():date);

    const day_week=dt.getDay();
    const [year,day_num,month_num,hr,mn,sec]=[dt.getFullYear(),dt.getDate(),dt.getMonth(),dt.getHours(),dt.getMinutes(),dt.getSeconds()];
    const [day,day_short,month,month_short]=[DAYS[day_week],DAYS_SHORT[day_week],MONTHS[month_num],MONTHS_SHORT[month_num]];
    const time=[`0${hr}`.slice(-2),`0${mn}`.slice(-2),`0${sec}`.slice(-2)].join(':');
    const obj={
        year,month,month_short,day,day_short,time,day_num,month_num:`0${month_num+1}`.slice(-2),
        hour:`0${hr}`.slice(-2), minute:`0${mn}`.slice(-2), sec:`0${sec}`.slice(-2)
    }
    return Object.entries(obj).reduce((p,[k,v])=>p.replace(`{${k}}`,`${v}`),format);
  }