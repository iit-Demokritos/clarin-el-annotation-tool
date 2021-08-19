import { Span } from './span';
import { Attribute } from './attribute'

export interface Annotation {
  _id: string;
  type: string;
  spans: Span[];
  attributes: Attribute[];
}
