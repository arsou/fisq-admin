import { Field } from "formik";
import { MouseEventHandler, SyntheticEvent, useEffect, useRef } from "react";
import { ArtistItem } from "../../models/artist";
import { MyFieldCheckbox, MyFieldSelect } from "../form-input/input";
import {config} from "../../config";

const {IMG_URL} = config ;

const closestToHeight = (height: number, art: ArtistItem) => {
  if (!art.images.length) return -1;
  return art.images.map((im) => Math.abs(im.height - height))
                   .reduce((p, dh, i, tb) =>dh<tb[p]?i:p, 0);
};

export type ArtistEditorProps = {
  artist: ArtistItem;
  index: number;
  height: number;
  onSelect: MouseEventHandler;
  to_delete?: boolean;
  xhr?: XMLHttpRequest;
  page: string;
};
export const ArtistEditor = (props: ArtistEditorProps) => {
  const { artist, height, index, page } = props;
  const i=closestToHeight(height, artist);
  const refBar=useRef<HTMLDivElement>(null);

  const onLoadImg = (evt: SyntheticEvent<HTMLImageElement>) => {
    const tgt = evt.currentTarget as HTMLImageElement;
    window.URL.revokeObjectURL(tgt.src);
  };

  useEffect(() => {
    const div=refBar.current as HTMLDivElement;
    if (!props.xhr) return;
    const onProgress = (evt: ProgressEvent) => {
      const pc=Math.round((100.0 * evt.loaded) / evt.total);
      div.style.width=div.innerHTML=`${pc}%`;
    };
    const onLoad = () =>div.style.width=div.innerHTML='100%';

    props.xhr.upload.addEventListener("progress", onProgress);
    props.xhr.addEventListener("load", onLoad);

    return () => {
      if (!props.xhr) return;
      props.xhr.upload.removeEventListener("progress", onProgress);
      props.xhr.removeEventListener("load", onLoad);
    };
  }, [props.xhr]);

  const options = [
    { value: "", title: "type", disabled: true },
    { value: "DJ", title: "dj", disabled: false },
    { value: "NATIONAL_ARTIST", title: "artiste nat.", disabled: false },
    { value: "INTERNATIONAL_ARTIST", title: "artiste inter.", disabled: false }
  ];

  const position2 = artist.image_file ? "position-relative" : "";
  const is_new = artist.image_file ? "border-info new" : "";
  
  return (
    <div className={`p-1 m-2 border rounded position-relative ${is_new} artist`} data-artist_id={artist.id}>
      <div style={{cursor: "pointer", height }} className={`artist-img ${position2}`} onClick={props.onSelect} >
        {artist.image_file?
        <img 
          src={window.URL.createObjectURL(artist.image_file)} 
          onLoad={onLoadImg} 
          className="h-100" alt=""/>:
        <img 
          src={`${IMG_URL}/${page}/${artist.images[i].name}`} 
          className="h-100" alt=""/>
        }
        
        {artist.image_file && 
        <div className="progress position-absolute top-50 start-0 end-0 bg-transparent">
          <div ref={refBar} className="progress-bar bg-success"/>
        </div>
        }
      </div>
      <div className="text-white text-start">
        <Field label="actif" name={`items.${index}.is_active`} component={MyFieldCheckbox} />
      </div>
      {artist.type && 
        <div><Field name={`items.${index}.type`} {...{options}} component={MyFieldSelect}/></div>
      }
      {props.to_delete && 
        <div className="position-absolute bg-danger start-0 end-0 top-0 bottom-0" onClick={props.onSelect}
          style={{ zIndex: 9, opacity: 0.7, cursor: "pointer" }}/>
      }
    </div>
  );
};
