import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message, AnnotationRelationComboboxStatusEntry, AnnotationRelationComboboxStatus } from 'src/app/models/services/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public static readonly ANNOTATION_RELATION_COMBOBOX_SELECT_ANNOTATION =
   "annotation-relation-combobox-select-annotation";

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
  public annotationRelationComboboxSet(element_id: string, annotation_id: string, annotation_attribute: string) {
    this.annotationRelationComboboxStatus[element_id] = {annotation_id: annotation_id, annotation_attribute: annotation_attribute};
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
}
