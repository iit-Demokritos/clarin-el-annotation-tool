export interface Message {
  name:  string;
  value: any;
}

export interface AnnotationRelationComboboxStatusEntry {
  annotation_id:        string;
  annotation_attribute: string;
  options?:             any;
}
export interface AnnotationRelationComboboxStatus {
  [element_id: string]: AnnotationRelationComboboxStatusEntry
}

export interface AttributeValueMemoryValue {
  value?:   string;
  segment?: string;
  start?:   number;
  end?:     number;
}
export interface AttributeValueMemory {
  [attribute_name: string]: AttributeValueMemoryValue;
}
