/*
 * Annotation Mode...
 */

export enum AnnotationMode {
  UNKNOWN,
  TEXT,
  IMAGE,
  AUDIO,
  VIDEO
};

export interface Selection {
  mode:        AnnotationMode;
  type:        string;
  // Field used for text annotation...
  startOffset: number;
  endOffset:   number;
  segment:     string;
  // Fields used for image annotation (bbox)...
  x:           number;
  y:           number;
  width:       number;
  height:      number;
  rotation:    number;
}; /* Selection */

export const SelectionDefaults: Selection = {
  mode: AnnotationMode.UNKNOWN,
  type: null,
  // Field used for text annotation...
  startOffset: -1,
  endOffset: -1,
  segment: "",
  // Fields used for image annotation (bbox)...
  x: -1,
  y: -1,
  width: -1,
  height: -1,
  rotation: 0,
}
