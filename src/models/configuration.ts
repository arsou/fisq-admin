import { Item } from "./item";
import * as Yup from "yup";

export class Configuration extends Item {
  start_date: string = "";
  end_date: string = "";
  edition_number: number = 0;
  shop_tax: number = 0;
  description_fr: string = "";
  description_en: string = "";
  title_fr: string = "";
  title_en: string = "";
  fb_url: string = "";

  protected constructor() {
    super();
  }

  static create(): Configuration {
    return new Configuration();
  }

  static clone(cfg: Configuration): Configuration {
    return { ...cfg } as Configuration;
  }

  static readonly validationSchema = Yup.object().shape({
    items: Yup.array().of(
      Yup.object().shape({
        start_date: Yup.string().required("champ requis *"),
        end_date: Yup.string().required("champ requis *"),
        description_fr: Yup.string().required("champ requis *"),
        description_en: Yup.string().required("champ requis *"),
        title_fr: Yup.string().required("champ requis *"),
        title_en: Yup.string().required("champ requis *"),
        fb_url: Yup.string().required("champ requis *"),
        edition_number: Yup.number().required("champ requis *").integer("nombre entier").min(1, "nombre positif"),
        shop_tax: Yup.number().required("champ requis *").min(0, "nombre positif ou nul *")
      })
    ).min(1,"Taille du tableau doit être 1")
    .max(1,"Taille du tableau doit être 1")
  });
}
