export interface EuropeanaSearchParameters {
  query:          string;
  qf?:            string;
  reusability?:   string;
  media?:         boolean;
  thumbnail?:     boolean;
  landingpage?:   boolean;
  colourpalette?: string;
  theme?:         string;
  sort?:          string;
  profile?:       string;
  rows?:          number;
  cursor?:        string;
  callback?:      string;
  facet?:         string;
  /*
   * Do not remove the following signature:
   * https://stackoverflow.com/questions/68040289/typescript-angular-12-cast-custom-object-into-params-object
   */
  [param: string]: string | number | boolean;
}

/*
 * Interface Generated From: https://jvilk.com/MakeTypes/
 */
export interface EuropeanaSearchResults {
  apikey: string;
  success: boolean;
  requestNumber: number;
  itemsCount: number;
  totalResults: number;
  nextCursor: string;
  items?: (ItemsEntity)[] | null;
  url: string;
  params: Params;
}
export interface ItemsEntity {
  dataProvider?: (string)[] | null;
  dcCreator?: (string)[] | null;
  dcCreatorLangAware?: DcCreatorLangAware;
  dcDescription?: (string)[] | null;
  dcDescriptionLangAware?: DcCreatorLangAwareOrDcDescriptionLangAware | null;
  dcTitleLangAware?: DcTitleLangAware;
  edmIsShownAt?: (string)[] | null;
  edmIsShownBy?: (string)[] | null;
  edmPreview?: (string)[] | null;
  europeanaCompleteness?: number;
  guid?: string;
  id?: string;
  link?: string;
  provider?: (string)[] | null;
  rights?: (string)[] | null;
  score?: number;
  title?: (string)[] | null;
  src?: string;
  type?: string;
}
export interface DcCreatorLangAware {
  def?: (string)[] | null;
  en?: (string)[] | null;
  fr?: (string)[] | null;
  zxx?: (string)[] | null;
}
export interface DcCreatorLangAwareOrDcDescriptionLangAware {
  def?: (string)[] | null;
  en?: (string)[] | null;
  fr?: (string)[] | null;
}
export interface DcTitleLangAware {
  fr?: (string)[] | null;
  de?: (string)[] | null;
  en?: (string)[] | null;
}
export interface Params {
  wskey: string;
  query: string;
  qf: string;
  reusability?: null;
  media: boolean;
  thumbnail: boolean;
  landingpage?: null;
  colourpalette?: null;
  theme?: null;
  sort: string;
  profile: string;
  rows: number;
  cursor: string;
  callback?: null;
  facet?: null;
}
