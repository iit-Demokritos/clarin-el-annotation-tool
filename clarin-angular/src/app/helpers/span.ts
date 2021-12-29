import { Span } from '../models/span';

export function spanEqual(span1: Span, span2: Span): boolean {
  if (span1.start == span2.start && span1.end == span2.end) {
    return true
  }
  return false;
}; /* spanEqual */

export function spansetEqual(spanset1: Span[], spanset2: Span[]): boolean {
  if (spanset1.length == spanset2.length) {
    for (let i = 0; i < spanset1.length; i++) {
      if (spanEqual(spanset1[i], spanset2[i]) == false) {
        return false;
      }
    }
    return true;
  }
  return false;
}; /* spansetEqual */
