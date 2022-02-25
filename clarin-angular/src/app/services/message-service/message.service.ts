import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message, AnnotationRelationComboboxStatusEntry, AnnotationRelationComboboxStatus,
         AttributeValueMemory, AttributeValueMemoryValue } from 'src/app/models/services/message';
import { NgProgress, NgProgressRef } from 'ngx-progressbar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _progressRef: NgProgressRef;

  constructor(private progress: NgProgress) {
    this._progressRef = this.progress.ref();
  };

  destructor() {
    this._progressRef.destroy();
  };

  public static readonly ANNOTATION_RELATION_COMBOBOX_SELECT_ANNOTATION =
   "annotation-relation-combobox-select-annotation";

  public static readonly COREF_ATTRIBUTE_VALUE =
   "coref-attribute-value";


  public messageAdded$: EventEmitter<Message> = new EventEmitter();

  /* Variables that are shared among components... */

  /*
   * Request for annotating a document...
   */
  public requestToAnnotateDocument;

  /* 
   * annotationRelationComboboxStatus:
   * Used by Button Annotator, if schema contains relations.
   * To recieve updates, the client must subscribe to annotationRelationComboboxSource:
   * ngOnInit() {
   *   this.subscription = this.messageService.subscribe(message => this.message = message)
   * }
   * ngOnDestroy() {
   *   this.subscription.unsubscribe();
   * }
   */
  public annotationRelationComboboxStatus: AnnotationRelationComboboxStatus = {};
  private annotationRelationComboboxSource = new BehaviorSubject(this.annotationRelationComboboxStatus);
  currentAnnotationRelationComboboxStatus = this.annotationRelationComboboxSource.asObservable();
  public annotationRelationComboboxSet(element_id: string, annotation_id: string, annotation_attribute: string, options: any = undefined) {
    this.annotationRelationComboboxStatus[element_id] = {annotation_id: annotation_id, annotation_attribute: annotation_attribute, options: options};
    this.annotationRelationComboboxSource.next(this.annotationRelationComboboxStatus);
    // console.error("MessageService: annotationRelationComboboxSet():", this.annotationRelationComboboxStatus);
  }
  public annotationRelationComboboxGet(): AnnotationRelationComboboxStatus {
    return this.annotationRelationComboboxStatus;
  }
  public annotationRelationComboboxGetForElement(element_id): AnnotationRelationComboboxStatusEntry {
    return this.annotationRelationComboboxStatus[element_id];
  }
  public annotationRelationComboboxClear(): void {
    this.annotationRelationComboboxStatus = {};
    this.annotationRelationComboboxSource.next(this.annotationRelationComboboxStatus);
  }
  
  public add(message: Message): void {
    this.messageAdded$.emit(message);
  }

  public annotationRelationComboboxSelectAnnotation(elem_id, ann_id) {
    // console.error("MessageService: annotationRelationComboboxSelectAnnotation():",
    //               elem_id, ann_id);
    this.add({
      name: MessageService.ANNOTATION_RELATION_COMBOBOX_SELECT_ANNOTATION,
      value: {annotation_id: ann_id, element_id: elem_id}
    });
  }

  /* Co-reference Annotator attribute value memory */
  public attributeValueMemory: AttributeValueMemory = {};
  private attributeValueMemorySource = new BehaviorSubject(this.attributeValueMemory);
  currentAttributeValueMemory = this.attributeValueMemorySource.asObservable();
  public attributeValueMemorySet(annotation_type: string, attribute_name: string, value: AttributeValueMemoryValue) {
    if (!(annotation_type in this.attributeValueMemory)) {
      this.attributeValueMemory[annotation_type] = {}
    }
    this.attributeValueMemory[annotation_type][attribute_name] = value;
    this.attributeValueMemorySource.next(this.attributeValueMemory);
  }
  public attributeValueMemoryGet(annotation_type: string): AttributeValueMemoryValue {
    return this.attributeValueMemory[annotation_type];
    // if (annotation_type && annotation_type in this.attributeValueMemory) {
    // }
    // return this.attributeValueMemory;
  }
  public attributeValueMemoryGetForAttribute(annotation_type: string, attribute_name: string): AttributeValueMemoryValue {
    return this.attributeValueMemory[annotation_type][attribute_name];
  }
  public attributeValueMemoryClear(): void {
    this.attributeValueMemory = {};
    this.attributeValueMemorySource.next(this.attributeValueMemory);
  }

  public attributeValueMemorySetAttributeValue(annotation_type: string, attribute_name: string, value: AttributeValueMemoryValue) {
    this.attributeValueMemorySet(annotation_type, attribute_name, value);
    this.add({
      name: MessageService.COREF_ATTRIBUTE_VALUE,
      value: {annotation_type: annotation_type, attribute_name: attribute_name, value: value}
    });
  }

  /* Progress Ref... */
  public progressRef(): NgProgressRef {
    return this._progressRef;
  }; /* progressRef */
}
