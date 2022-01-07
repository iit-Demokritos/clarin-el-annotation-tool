import { formatDate } from '@angular/common';
import { Annotation } from '../models/annotation';
import { Span } from '../models/span';
import { attributesetEqual } from './attribute';
import { spansetEqual } from './span';
import { pickFromObject } from './globalFunctions';

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
  set?:  number;
}

export function sortAnnotationSet(annotations: Annotation[]): Annotation[] {
  // Create a list of indexes, spans, adding spans if missing...
  var indexes = annotationSetToSpanIndexes(annotations);
  // Sort the list of indexes...
  indexes.sort((ann1, ann2) => compareAnnotationsSpans(ann1, ann2));
  // Map indexes to annotations...
  return indexes.map(i => annotations[i.index]);
}; /* sortAnnotationSet */

export function diffAnnotationSets(annotationSets: Annotation[][]): Annotation[][] {
  /* Put the set index in each annotation... */
  annotationSets = annotationSets.map((set, index) => {
    return set.map((ann) => {let ann_cp = {...ann}; ann_cp['diff_set_index'] = index; return ann_cp;});
  });
  // Get the number of sets...
  var sets = annotationSets.length;
  var newAnnotationSets = Array(sets);
  for (let i = 0; i < sets; i++) {newAnnotationSets[i] = [{}];}
  /* Now each annotation has a set id. Put all annotations in a list... */
  // var all_annotations = annotationSets.flat(); flat() is not available...
  // Filter empty items...
  var all_annotations = [].concat(...annotationSets).filter((ann) => 'type' in ann);
  // Get indexes for each set...
  var annotationsIndexes = annotationSetToSpanIndexes(all_annotations);
  // Sort the list of indexes...
  annotationsIndexes.sort((ann1, ann2) => compareAnnotationsSpans(ann1, ann2));
  var newRow = 0;
  // Get the first annotation, which is the lower one..
  var ann = annotationsIndexes.shift();
  var annotation = all_annotations[ann.index];
  // Put the annotation in the row...
  var set_index = annotation['diff_set_index']; delete annotation['diff_set_index'];
  newAnnotationSets[set_index][newRow] = annotation;
  // Iterate over the rest of the annotations:
  // * if they are the same as ann, add it in the same row.
  // * if the new ann is different, start a new row...
  let next_ann = annotationsIndexes.shift();
  while (next_ann) {
    if (compareAnnotationsSpans(ann, next_ann) != 0) {
      // Add a new row!
      newAnnotationSets.forEach((set) => set.push({})); newRow += 1;
    }
    ann = next_ann;
    annotation = all_annotations[ann.index];
    set_index = annotation['diff_set_index']; delete annotation['diff_set_index'];
    newAnnotationSets[set_index][newRow] = annotation;
    next_ann = annotationsIndexes.shift();
  }
  return newAnnotationSets;
}; /* diffAnnotationSets */

export function diffedAnnotationSetsToRatersMatrix(annotations: Annotation[][],
                                                   attributeName: string = "type",
                                                   attributeValues: string[] = []): number[][] {
  var values: string[];
  if (attributeValues.length) {
    values = attributeValues;
  } else {
    values = diffedAnnotationSetsCategories(annotations, attributeName);
  }
  // Get the shape of the input matrix...
  var children = annotations.length;
  var N = annotations[0].length; // 'N' = number of subjects
  var k = values.length;
  // Generate the matrix...
  var cm: number[][] = [];
  var c, ann, row, col;
  for (let i = 0; i < N; i++) {
    row = Array(children).fill("");
    // Fill the matrix...
    for (c = 0; c < children; c++) {
      ann = annotations[c][i];
      if ('attributes' in ann) {
        ann.attributes.some((attr) => {
          if ('name' in attr && attr.name == attributeName) {
            col = values.indexOf(attr.value);
            if (col != -1) {
              row[c] = attr.value;
              return true;
            }
          }
          return false;
        });
      }
    }
    cm.push(row);
  }
  return cm;
}; /* diffedAnnotationSetsToRatersMatrix */

export function diffedAnnotationSetsToCategoriesMatrix(annotations: Annotation[][],
                                                      attributeName: string = "type",
                                                      attributeValues: string[] = []): number[][] {
  var values: string[];
  if (attributeValues.length) {
    values = attributeValues;
  } else {
    values = diffedAnnotationSetsCategories(annotations, attributeName);
  }
  // Get the shape of the input matrix...
  var children = annotations.length;
  var N = annotations[0].length; // 'N' = number of subjects
  var k = values.length;
  // Generate the matrix...
  var cm: number[][] = [];
  var c;
  var ann;
  var row;
  var col;
  for (let i = 0; i < N; i++) {
    row = Array(k).fill(0);
    // Fill the matrix...
    for (c = 0; c < children; c++) {
      ann = annotations[c][i];
      if ('attributes' in ann) {
         ann.attributes.some((attr) => {
           if ('name' in attr && attr.name == attributeName) {
             col = values.indexOf(attr.value);
             if (col != -1) {
               row[col] += 1;
               return true;
             }
           }
           return false;
         });
      }
    }
    cm.push(row);
  }
  return cm;
}; /* diffedAnnotationSetsToCategoriesMatrix */

export function diffedAnnotationSetsRaters(annotations: Annotation[][]) {
  return annotations.map((rater, index) => `Rater ${index+1}`);
}; /* diffedAnnotationSetsRaters */

export function diffedAnnotationSetsCategories(annotations: Annotation[][],
                                               attributeName: string = "type") {
  var values = [];
  annotations.forEach((child) => {
    // Child is a list of annotation. Collect attribute values...
    child.forEach((ann) => {
      if ('attributes' in ann) {
        ann.attributes.forEach((attr) => {
          if ('name' in attr && attr.name == attributeName) {
            if (!values.includes(attr.value)) {
              values.push(attr.value);
            }
          }
        });
      }
    });
  });
  values.sort();
  return values;
}; /* diffedAnnotationSetsCategories */

export function annotationSetToSpanIndexes(annotations: Annotation[]): AnnotationSpansIndexer[] {
  return annotations.map((ann, index) => {
    if (ann.spans && ann.spans.length) {
      // A normal annotation...
      return { index: index, spans: ann.spans };
    } else if (ann.attributes) {
      // The annotation does not have any spans. Check if we can find some related annotations...
      let relation_args = ann.attributes.filter(attr => attr["name"] == "arg1" || attr["name"] == "arg2");
      if (relation_args.length) {
        let spans = relation_args.reduce((accumulator, attr) => {
          let _ann = annotations.find(a => a._id == attr.value);
          if (_ann) { return accumulator.concat(_ann.spans); }
          return accumulator;
        }, []);
        return {
          index: index,
          spans: spans
        };
      } else {
        // There is nothing more we can do.
        return { index: index, spans: ann.spans };
      }
    } else {
      // There is nothing more we can do.
      return { index: index, spans: ann.spans };
    }
  });
}; /* annotationSetToSpanIndexes */

export function compareAnnotationsSpans(ann1: AnnotationSpansIndexer, ann2: AnnotationSpansIndexer): number {
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
  if (minstart1 > minstart2) {
    return 1;
  }
  if (minstart1 < minstart2) {
    return -1;
  }
  if (minstart1 == minstart2) {
    var minend1 = Math.min(...ann1.spans.map(span => span.end));
    var minend2 = Math.min(...ann2.spans.map(span => span.end));
    // console.error("mine:", minend1, minend2);
    /* We consider the Annotation having the longest span as greater... */
    if (minend1 > minend2) {
      return 1;
    }
    if (minend1 < minend2) {
      return -1;
    }
    if (minend1 == minend2) {
      var maxend1 = Math.max(...ann1.spans.map(span => span.end));
      var maxend2 = Math.max(...ann2.spans.map(span => span.end));
      // console.error("maxe:", maxend1, maxend2);
      if (maxend1 > maxend2) {
        return 1;
      }
      if (maxend1 < maxend2) {
        return -1;
      }
      if (maxend1 == maxend2) {
        /* We consider the Annotation having the more spans as greater... */
        if (items1 == items2) {
          return 0; /* Missing. Bug reported by Sigletos */
        }
        if (items1 > items2) {
          return 1;
        }
        if (items1 < items2) {
          return -1;
        }
      }
    }
  }
  return -1;
}; /* compareAnnotationsSpans */

/*
 * Keep fields:
 *   type
 *   spans
 *   attributes
 *   annotator_id
 */
export function excludeFields(ann: Annotation) {
  return pickFromObject(ann, "type", "spans", "attributes", "annotator_id");
}; /* excludeFields */

export function annotationsEqual(ann1, ann2): boolean {
  if (ann1 === undefined || ann2 === undefined) {
    return false;
  }
  //check equality for type
  if (ann1["type"] == ann2["type"]) {
    //check equality for annnotator_id
    if ((ann1["annotator_id"] == ann2["annotator_id"]) || ((ann1["annotator_id"] === undefined) && (ann2["annotator_id"] === undefined))) {
      //check equality for spans
      if (spansetEqual(ann1["spans"], ann2["spans"]) == true) {
        //check equality for attributes
        if (attributesetEqual(ann1["attributes"], ann2["attributes"]) == true) {
          return true;
        }
      }
    }
  }
  return false;
}; /* annotationsEqual */

export function getDistinctAnnotations(annotations) {
  let unique_annotations = [];
  let exists = false;
  for (let ann of annotations) {
    for (let uniq_ann of unique_annotations) {
      exists = annotationsEqual(ann, uniq_ann);
      if (exists == true) {
        break;
      }
    }
    if (exists == false) {
      unique_annotations.push(ann);
    }
    exists = false;
  }
  return unique_annotations;
}; /* getDistinctAnnotations */

export function countAnnotation(annotations, ann): number {
  var count = 0;
  for (let annotation of annotations) {
    if (annotationsEqual(annotation, ann) == true) {
      count = count + 1;
    }
  }
  return count;
}; /* countAnnotation */

// Computes Cohen kappa for pair-wise annotators.
export function cohenKappa(sortedAnn1, sortedAnn2): number {
  //param sortedAnn1: annotations provided by first annotator
  //type sortedAnn1: list
  //param sortedAnn2: annotations provided by second annotator
  //type sortedAnn2: list
  //rtype: float
  //return: Cohen kappa statist

  /*remove unnecessary  fields from annotations*/
  var anns1 = sortedAnn1.map(ann => excludeFields(ann));
  var anns2 = sortedAnn2.map(ann => excludeFields(ann));
  var cohen_kappa: number;

  var count = 0;
  //zip anns1 & anns2
  var zippedann = anns1.map(function (e, i) {
    return [e, anns2[i]];
  });
  zippedann.forEach(sortedAnns => {
    let ann1 = sortedAnns[0];
    let ann2 = sortedAnns[1];

    if (annotationsEqual(ann1, ann2)) {
      count += 1;
    }
  });
  //observed agreement A (Po)
  var A = count / anns1.length;
  // concat anns1 and anns2
  var anns = anns1.concat(anns2);
  //get unique annotations
  var unique_annotations = getDistinctAnnotations(anns);
  //expected agreement E (Pe)
  var E = 0;
  count = 0;
  var cnt1 = 0
  var cnt2 = 0;
  for (let u_ann of unique_annotations) {
    cnt1 = countAnnotation(anns1, u_ann);
    cnt2 = countAnnotation(anns2, u_ann);
    count = ((cnt1 / anns1.length) * (cnt2 / anns2.length));
    E += count;
  }

  cohen_kappa = parseFloat(((A - E) / (1 - E)).toFixed(4));
  return cohen_kappa;
}; /* cohenKappa */

export function fleissKappa(M:number[][], n_annotators: number = -1): number {
  /* Wikipedia's example. Fleiss Kappa: 0.20993070442195522
    M = [
      [0, 0, 0, 0, 14],
      [0, 2, 6, 4,  2],
      [0, 0, 3, 5,  6],
      [0, 3, 9, 2,  0],
      [2, 2, 8, 1,  1],
      [7, 7, 0, 0,  0],
      [3, 2, 6, 3,  0],
      [2, 5, 3, 2,  2],
      [6, 5, 2, 1,  0],
      [0, 2, 2, 3,  7],
    ];
    n_annotators = 14;
  */
  // N is # of items, k is # of categories
  var N = M.length;
  var k = M[0].length;
  if (n_annotators < 0) {
    // TODO: Fix: This is an estimation...
    console.error("fleissKappa: Please provide the number of annotators!");
    n_annotators = M[0].reduce((accumulator, curr) => accumulator + curr);
    console.error("fleissKappa: Using estimated number of annotators:", n_annotators);
  }
  var tot_annotations = 0;
  // Iterate over the matrix, and calculate the various sums...
  var p: number[] = Array(k).fill(0.0);
  var P: number[] = Array(N).fill(0.0);
  var i: number, j: number;
  var P_bar: number   = 0.0;
  var P_bar_e: number = 0.0;
  M.forEach((item, i) => {
    item.forEach((cat, j) => {
      tot_annotations += cat;
      p[j] += cat;
      P[i] += (cat * cat);
    });
  });
  for (i = 0; i < k; i++) {
    p[i] = p[i] / ( N * n_annotators);
    P_bar_e += (p[i] * p[i]);
  }
  for (i = 0; i < N; i++) {
    P[i] = (P[i] - n_annotators) / (n_annotators * (n_annotators - 1));
    P_bar += P[i];
  }
  P_bar /= N;
  // console.error("N:", N, "k:", k, "n_annotators:", n_annotators, "tot_annotations:", tot_annotations);
  // console.error("P:", P);
  // console.error("p:", p);
  return (P_bar - P_bar_e) / (1.0 - P_bar_e);
}; /* fleissKappa */
