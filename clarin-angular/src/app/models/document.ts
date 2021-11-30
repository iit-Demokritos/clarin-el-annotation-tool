export interface Document {
  id:                     number;
  collection_id:          number;
  name:                   string;
  external_name:          string;
  type:                   string;
  text:                   string;
  data_text?:             string;
  data_binary?:           any;
  encoding:               string;
  handler:                string;
  visualisation_options?: any;
  owner_id?:              number;
  owner_email?:           string;
  metadata?:              any;
  version?:               number;
  updated_by?:            string;
  created_at?:            string;
  updated_at?:            string;
}

export interface DocumentGroup {
  name:      string;
  count:     number;
  documents: Document[] | any;
  disabled:  boolean;
  selected:  boolean;
}
