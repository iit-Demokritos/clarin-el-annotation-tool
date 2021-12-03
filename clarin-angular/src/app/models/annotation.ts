import { Span } from './span';
import { Attribute } from './attribute'

export interface Annotation {
  _id:                 string;
  type:                string;
  spans:               Span[];
  attributes:          Attribute[];
  collection_id?:      number;
  document_id?:        number;
  owner_id?:           number;
  annotator_id?:       string;
  document_attribute?: string;
  collection_setting?: string;
  document_setting?:   string;
  created_at?:         string;
  created_by?:         string;
  updated_at?:         string;
  updated_by?:         string;
  deleted_at?:         string;
  deleted_by?:         string;
}
