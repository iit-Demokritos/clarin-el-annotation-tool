import { Annotation } from '../models/annotation';
import { Span } from '../models/span';

export interface DiffRow {
  /** Array of annotations from each set (length matches number of input sets) */
  annotations: (Annotation | undefined)[];
  /** Status of the alignment in this row */
  status: 'equal' | 'unequal' | 'partial';
}

/**
 * Helper to get the value of the "type" attribute of an annotation.
 * It looks into the attributes array for an attribute named "type".
 * If not found, it falls back to the top-level "type" property.
 */
export function getAnnotationType(ann: Annotation): string {
  if (ann.attributes) {
    const typeAttr = ann.attributes.find(attr => attr.name === 'type');
    if (typeAttr) {
      return String(typeAttr.value);
    }
  }
  return ann.type || '';
}

/**
 * Compares only the spans of two annotations.
 * Returns 0 if spans are identical, otherwise returns the comparison result.
 */
export function compareSpans(ann1: Annotation, ann2: Annotation): number {
  const spans1 = ann1.spans || [];
  const spans2 = ann2.spans || [];

  const len = Math.min(spans1.length, spans2.length);
  for (let i = 0; i < len; i++) {
    if (spans1[i].start !== spans2[i].start) {
      return spans1[i].start - spans2[i].start;
    }
    if (spans1[i].end !== spans2[i].end) {
      return spans1[i].end - spans2[i].end;
    }
  }
  return spans1.length - spans2.length;
}

/**
 * Compares two annotations for sorting purposes.
 * Sorts primarily by spans, then by type, then by ID.
 */
export function compareAnnotationsForSorting(ann1: Annotation, ann2: Annotation): number {
  const spanCmp = compareSpans(ann1, ann2);
  if (spanCmp !== 0) return spanCmp;

  const type1 = getAnnotationType(ann1);
  const type2 = getAnnotationType(ann2);
  const typeCmp = type1.localeCompare(type2);
  if (typeCmp !== 0) return typeCmp;

  return (ann1._id || '').localeCompare(ann2._id || '');
}

/**
 * Creates a diff between any number of annotation sets.
 * Aligns annotations by span, then by type.
 * @param sets An array of annotation arrays (one for each set to compare).
 */
export function diffAnnotationSets(sets: Annotation[][]): DiffRow[] {
  const numSets = sets.length;
  if (numSets === 0) return [];

  // 1. Sort all sets to allow linear alignment
  const sortedSets = sets.map(set => [...set].sort(compareAnnotationsForSorting));
  const ptrs = new Array(numSets).fill(0);
  const diff: DiffRow[] = [];

  while (ptrs.some((ptr, i) => ptr < sortedSets[i].length)) {
    // 2. Find the minimum span among all current annotations across all sets
    let minAnn: Annotation | undefined = undefined;
    for (let i = 0; i < numSets; i++) {
      if (ptrs[i] < sortedSets[i].length) {
        const ann = sortedSets[i][ptrs[i]];
        if (!minAnn || compareSpans(ann, minAnn) < 0) {
          minAnn = ann;
        }
      }
    }

    if (!minAnn) break;

    // 3. Collect all annotations with this exact span into buckets
    const buckets: Annotation[][] = Array.from({ length: numSets }, () => []);
    for (let i = 0; i < numSets; i++) {
      while (ptrs[i] < sortedSets[i].length && compareSpans(sortedSets[i][ptrs[i]], minAnn!) === 0) {
        buckets[i].push(sortedSets[i][ptrs[i]]);
        ptrs[i]++;
      }
    }

    // 4. Align annotations within these buckets (all have the same span)

    // a. Identify types present in more than one set for this span
    const typeCounts: Record<string, number> = {};
    buckets.forEach(bucket => {
      const seenInBucket = new Set<string>();
      bucket.forEach(ann => seenInBucket.add(getAnnotationType(ann)));
      seenInBucket.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    const sharedTypes = Object.keys(typeCounts)
      .filter(type => typeCounts[type] > 1)
      .sort();

    // b. Match shared types first
    for (const type of sharedTypes) {
      while (buckets.some(bucket => bucket.some(ann => getAnnotationType(ann) === type))) {
        const rowAnns: (Annotation | undefined)[] = new Array(numSets).fill(undefined);
        for (let i = 0; i < numSets; i++) {
          const index = buckets[i].findIndex(ann => getAnnotationType(ann) === type);
          if (index !== -1) {
            rowAnns[i] = buckets[i].splice(index, 1)[0];
          }
        }
        diff.push({ annotations: rowAnns, status: calculateStatus(rowAnns) });
      }
    }

    // c. Match remaining orphans (different types, same span) into rows
    while (buckets.some(bucket => bucket.length > 0)) {
      const rowAnns: (Annotation | undefined)[] = new Array(numSets).fill(undefined);
      for (let i = 0; i < numSets; i++) {
        if (buckets[i].length > 0) {
          rowAnns[i] = buckets[i].shift();
        }
      }
      diff.push({ annotations: rowAnns, status: calculateStatus(rowAnns) });
    }
  }

  return diff;
}

/**
 * Calculates the status of a diff row based on type consensus and presence.
 */
function calculateStatus(rowAnns: (Annotation | undefined)[]): DiffRow['status'] {
  const present = rowAnns.filter(ann => !!ann) as Annotation[];
  if (present.length === 0) return 'equal';
  
  const firstType = getAnnotationType(present[0]);
  const allSameType = present.every(ann => getAnnotationType(ann) === firstType);
  
  if (!allSameType) return 'unequal';
  if (present.length < rowAnns.length) return 'partial';
  return 'equal';
}

/**
 * Compares two sets of spans for equality. (Utility)
 */
export function spansEqual(spans1: Span[], spans2: Span[]): boolean {
  if (spans1.length !== spans2.length) {
    return false;
  }
  for (let i = 0; i < spans1.length; i++) {
    if (spans1[i].start !== spans2[i].start || spans1[i].end !== spans2[i].end) {
      return false;
    }
  }
  return true;
}
