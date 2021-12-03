import { formatDate } from '@angular/common';
import { Annotation } from '../models/annotation';

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

export function sortAnnotationSet(annotations: Annotation[]): Annotation[] {
  var annotations_set=annotations;
  for (var i = 0; i < annotations_set.length; i++) {
    var spans = annotations_set[i].spans;
    if (spans.length == 0) {
      var ann_attributes = annotations_set[i].attributes;
      var args = ann_attributes.filter(attr => {
        if (attr["name"] == "arg1" || attr["name"] == "arg2") {
          return attr["value"];
        } else {
          return null;
        }
      });
      if (args.length > 0) {
        var arg1 = args[0].value;
        var arg2 = args[1].value;
        var argann1 = annotations_set.find(ann => ann._id === arg1);
        var argann2 = annotations_set.find(ann => ann._id === arg2);
        annotations_set[i].spans.push(argann1.spans[0]);
        annotations_set[i].spans.push(argann2.spans[0]);
      }
    }
  }
  return annotations_set.sort((ann1, ann2) => compareAnnotations(ann1, ann2));
}; /* sortAnnotationSet */

export function compareAnnotations(ann1:Annotation, ann2:Annotation):number {
  var minstart1 = -1;
  var minend1   = -1;
  var minstart2 = -1;
  var minend2   = -1;
  var spans     = ann1.spans;
  var spanset1  = null;
  if (spans.length != 0) {
    spanset1 = spans.map(element => { return {"start":element.start,"end":element.end};});
    // spans.forEach(element =>
    //   {spanset1.push({"start":element.start,"end":element.end})
    // });
  } else {
    spanset1 = null;
  }
  if (spanset1 == null) {
    return 30;
  }

  var spans = ann2.spans;
  var spanset2 = null;
  if (spans.length != 0) {
    spanset2 = spans.map(element => { return {"start":element.start,"end":element.end};});
    // spans.forEach(element =>
    //   {spanset2.push({"start":element.start,"end":element.end})
    // })
  } else {
    spanset2 = null;
  }
  if (spanset2 == null) {
    return 40;
  }
  var items1 = spanset1.length;
  var items2 = spanset2.length;
  for (var i = 0; i < items1 && i < items2; i++) {
    var start = spanset1[i].start;
    var end   = spanset1[i].end;
    if (minstart1 < 0 || minstart1 > start) {
        minstart1 = start;
    }
    if (minend1 < 0   || minend1 > end) {
        minend1   = end;
    }
    var start = spanset2[i].start;
    var end   = spanset2[i].end;
    if (minstart2 < 0 || minstart2 > start) {
        minstart2 = start;
    }
    if (minend2 < 0   || minend2 > end) {
        minend2   = end;
    }
  }
  if (minstart1  > minstart2){
     return  1;
  }
  if (minstart1  < minstart2){
     return -1;
  }
  if (minstart1 == minstart2) {
    /* We consider the Annotation having the longest span as greater... */
    if (minend1  > minend2) {
      return  1;
    }
    if (minend1  < minend2){
      return -1;
    }
    if (minend1 == minend2) {
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
  return -1;
 }; /* compareAnnotations */
