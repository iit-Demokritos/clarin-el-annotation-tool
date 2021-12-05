import { formatDate } from '@angular/common';
import { Annotation } from '../models/annotation';
import { Span } from '../models/span';


export function AnnotationPropertyToDisplayObject(p) {
  switch (p[0]) {
    case "_id":
      return { name: "ID", value: p[1] };
      break;
    case "type":
      return { name: "Type", value: p[1] };
      break;
    case "annotator_id":
      return { name: "Annotator ID", value: p[1] };
      break;
    case "spans":
      return {
        name: "Spans", value: p[1].map(e =>
          e.start.toString() + ":" + e.end.toString() + " [\"" + e.segment + "\"]"
        ).join("\n")
      };
      break;
    case "attributes":
      return {
        name: "Attributes", value: p[1].map(e =>
          e.name + " - \"" + e.value + "\""
        ).join("\n")
      };
      break;
    case "document_attribute":
      return { name: "Document Attribute", value: p[1] };
      break;
    case "collection_setting":
      return { name: "Collection Setting", value: p[1] };
      break;
    case "document_setting":
      return { name: "Document Setting", value: p[1] };
      break;
    case "created_by":
      return { name: "Created By", value: p[1] };
      break;
    case "updated_by":
      return { name: "Updated By", value: p[1] };
      break;
    case "created_at":
      return {
        name: "Created At",
        value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
      };
      break;
    case "updated_at":
      return {
        name: "Updated At",
        value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
      };
      break;
    case "owner_id":
    case "document_id":
    case "collection_id":
      return null;
      break;
    default:
      return { name: p[0], value: JSON.stringify(p[1]) };
      break;
  }
}; /* AnnotationPropertyToDisplayObject */

interface AnnotationSpansIndexer {
  index: number;
  spans: Span[];
}

export function sortAnnotationSet(annotations: Annotation[]): Annotation[] {
  // Create a list of indexes, spans, adding spans if missing...
  var indexes = annotations.map((ann, index) => {
    if (ann.spans.length) {
      // A normal annotation...
      return {index: index, spans: ann.spans};
    } else {
      // The annotation does not have any spans. Check if we can find some related annotations...
      let relation_args = ann.attributes.filter(attr => attr["name"] == "arg1" || attr["name"] == "arg2");
      if (relation_args.length) {
        let spans = relation_args.reduce((accumulator, attr) => {
          let _ann = annotations.find(a => a._id == attr.value);
          if (_ann) {return accumulator.concat(_ann.spans);}
          return accumulator;
        }, []);
        return {
          index: index,
          spans: spans
        };
      } else {
        // There is nothing more we can do.
        return {index: index, spans: ann.spans};
      }
    }
  });
  // Sort the list of indexes...
  indexes.sort((ann1, ann2) => compareAnnotations(ann1, ann2));
  // Map indexes to annotations...
  return indexes.map(i => annotations[i.index]);
}; /* sortAnnotationSet */

export function compareAnnotations(ann1:AnnotationSpansIndexer, ann2:AnnotationSpansIndexer):number {
  var items1 = ann1.spans.length;
  var items2 = ann2.spans.length;
  // Check existence of spans...
  if (items1 == 0) {
    if (items2 == 0) return 0; // They are equal
    return 1; // Set ann1 as "greater", at the end
  } else if (items2 == 0) {
    return -1; // Set ann2 as "greater", at the end
  }
  // Both annotations have spans...
  var minstart1 = Math.min(...ann1.spans.map(span => span.start));
  var minstart2 = Math.min(...ann2.spans.map(span => span.start));
  // console.error("mins:", minstart1, minstart2);
  if (minstart1  > minstart2) {
    return  1;
  }
  if (minstart1  < minstart2) {
    return -1;
  }
  if (minstart1 == minstart2) {
    var minend1   = Math.min(...ann1.spans.map(span => span.end));
    var minend2   = Math.min(...ann2.spans.map(span => span.end));
    // console.error("mine:", minend1, minend2);
    /* We consider the Annotation having the longest span as greater... */
    if (minend1  > minend2) {
      return  1;
    }
    if (minend1  < minend2) {
      return -1;
    }
    if (minend1 == minend2) {
      var maxend1 = Math.max(...ann1.spans.map(span => span.end));
      var maxend2 = Math.max(...ann2.spans.map(span => span.end));
      // console.error("maxe:", maxend1, maxend2);
      if (maxend1  > maxend2) {
        return  1;
      }
      if (maxend1  < maxend2) {
        return -1;
      }
      if (maxend1 == maxend2) {
        /* We consider the Annotation having the more spans as greater... */
        if (items1 == items2) {
          return  0; /* Missing. Bug reported by Sigletos */
        }
        if (items1 >  items2) {
          return  1;
        }
        if (items1 <  items2) {
          return -1;
        }
      }
    }
  }
  return -1;
 }; /* compareAnnotations */
