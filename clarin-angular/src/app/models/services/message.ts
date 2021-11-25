export interface Message {
  name:  string;
  value: any;
}

export interface AnnotationRelationComboboxStatusEntry {
  annotation_id:       string;
  annotation_attribute: string;
}
export interface AnnotationRelationComboboxStatus {
  [element_id: string]: AnnotationRelationComboboxStatusEntry
}
