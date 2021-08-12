import { DragEvent} from "react";
import { ComponentClass, FC} from "react";
import {exclude} from "../../../utils/util";

export function SortableElement<P>(ComponentElm:FC<P>|ComponentClass<P>){
  return (props:P&{sortableElmIndex:number, sortableElmId:string})=>(
    <div className="sortable-item" draggable={true} 
      data-index={props.sortableElmIndex} data-item_id={props.sortableElmId}>        
      <ComponentElm {...(exclude(props,'sortableElmIndex','sortableElmId')as P)}/>
    </div>
  )
}

type SortableProps={
  onSortEnd?:(old_index:number,new_index:number)=>void
}

export function SortableContainer<P>(CmpElm:FC<P>|ComponentClass<P>){
  const context:{dragElm:null|HTMLElement,entryPos:{x:number,y:number}} = {
    dragElm: null,
    entryPos: { x: -1, y: -1 }
  };
  return (props:P&SortableProps)=>{
    const onDrag = (evt: DragEvent<HTMLElement>) => {};

    const onDragStart = (evt: DragEvent<HTMLElement>) => {
      const tgt = (evt.target as HTMLElement).closest(".sortable-item") as HTMLElement;
      if (!tgt) return;
      tgt.classList.add("dragged");
      context.dragElm = tgt;
    };

    const onDragEnter = (evt: DragEvent<HTMLElement>) => {
      const tgt = (evt.target as HTMLElement).closest(".sortable-item") as HTMLElement;
      if (!tgt) return;
      evt.preventDefault();

      if (tgt.dataset.item_id === context.dragElm?.dataset.item_id) return;
      tgt.classList.add("dragenter");
      context.entryPos = { x: evt.pageX, y: evt.pageY };
    };

    const onDragOver = (evt: DragEvent<HTMLElement>) => {
      const tgt=evt.target as HTMLElement;
      if (tgt.closest(".sortable-item")) evt.preventDefault();
    };
  
    const onDragLeave = (evt: DragEvent<HTMLElement>) => {
      const tgt = (evt.target as HTMLElement).closest(".sortable-item") as HTMLElement;
      if (!tgt) return;
      if (tgt.dataset.item_id === context.dragElm?.dataset.item_id) return;
      tgt.classList.remove("dragenter");
    };
  
    const onDrop = (evt: DragEvent<HTMLElement>) => {
      const tgt = (evt.target as HTMLElement).closest(".sortable-item") as HTMLElement;
      if (!tgt) return;
      evt.preventDefault();
      
      const old_index = parseInt(context.dragElm?.dataset.index as string, 10);
      const new_index = parseInt(tgt.dataset.index as string, 10);
      const {x,y}=context.entryPos;
      const [dx, dy] = [evt.pageX - x, evt.pageY - y];
      const [adx, ady] = [Math.abs(dx), Math.abs(dy)];
      const pos =
        (ady > adx && dy < 0) || (ady <= adx && dx < 0)
          ? "beforebegin"
          : "afterend";
  
      context.dragElm?.classList.remove("dragged");
      tgt.classList.remove("dragenter");
      tgt.insertAdjacentElement(pos, context.dragElm as HTMLElement);
 
      context.dragElm = null;
      context.entryPos = { x: -1, y: -1 };
      if (props.onSortEnd) props.onSortEnd(old_index, new_index);
    }


    const events = {
      onDrag, onDragStart, onDragEnter, 
      onDragOver, onDragLeave, onDrop
    };
  
    return (
      <div className="sortable" {...events}>
        <CmpElm {...(exclude(props,'onSortEnd')as P)}/>
      </div>
    );
  }
}