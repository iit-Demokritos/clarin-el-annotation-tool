import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import * as _ from 'lodash';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'select-document-modal',
  templateUrl: './select-document-modal.component.html',
  styleUrls: ['./select-document-modal.component.scss']
})
export class SelectDocumentModalComponent extends MainDialogComponent implements OnInit {

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      element: node
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataForTheTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  collectionCount: number = 0;

  ngOnInit() {
    let annotationSchema = this.data.annotationSchema;
    if (typeof (annotationSchema) != "undefined" && Object.keys(annotationSchema).length != 0) {
      this.annotationSchemaExists = true;
      this.subheader = this.data.annotator;
    }
    this.dataForTheTree.data = this.data.collectionsData;
    this.initializeLanguages();
    this.collectionCount = this.treeControl.dataNodes.filter(node => node.expandable == true).length;
    // Is there a request to annotated a specific document?
    if (this.messageService.requestToAnnotateDocument) {
      this.selectedDocument = this.messageService.requestToAnnotateDocument;
      this.messageService.requestToAnnotateDocument = undefined;
      this.selectDocument();
    }
  }

  nodeSelected(node) {
  }

  subheader = "Button Annotator";
  annotationSchemaExists = false;
  showSelectDocument = true;
  documentSelectorHeight = 300;
  selectedDocument = {};
  treeOptions = { dirSelectable: false };
  selectedCollection: any;

  flash = "";
  annotationSchema = {
    language: "",
    annotation_type: "",
    attribute: "",
    alternative: ""
  };
  annotationSchemaOptions = {
    languages: [],
    annotation_types: [],
    attributes: [],
    alternatives: [],
    values: []
  };

  groups = [];
  attrs = [];

  emptyValuesArrays() {
    this.groups = [];
    this.attrs = [];

    if (this.subheader == "Button Annotator") {
      this.annotationSchemaOptions.values = [];
    } else {
      this.annotationSchemaOptions.attributes = [];
    }
  }

  initializeLanguages() { //fill the language select
    this.annotationSchemaService.restore(this.subheader)
      .then((response: any) => {
        this.annotationSchemaOptions = _.cloneDeep(response.annotationSchemaOptions);
        this.annotationSchema = _.cloneDeep(response.savedAnnotationSchema);
        this.changeAttributeAlternative(this.annotationSchema.alternative);
      }, (languages: any) => {
        console.error(languages);
        if (typeof (languages) != "undefined") {
          this.flash = "";
          console.error(languages);
          this.annotationSchemaOptions.languages = languages.annotationSchemaOptions.languages;
        } else
          this.flashMessage.show("An error occured. Please refresh the page and try again", { cssClass: 'alert alert-warning', timeout: 2000 });
      });
  };

  updateSubheader(subheaderValue) {
    if (this.subheader != subheaderValue) {
      this.subheader = subheaderValue;
      this.initializeLanguages();
    }
  };

  changeLanguage(lang) { //trigger function when the language changes
    this.annotationSchema.language = lang;
    this.changeAttributeAlternative(null);

    switch (this.subheader) {
      case "Button Annotator":
        this.buttonAnnotatorService.getAnnotationTypes(this.annotationSchema.language).then((data: any) => {
          this.annotationSchemaOptions.annotation_types = data.annotation_types;
        });
        break;
      case "Coreference Annotator":
        this.coreferenceAnnotatorService.getAnnotationTypes(this.annotationSchema.language).then((data: any) => {
          this.annotationSchemaOptions.annotation_types = data.annotation_types;
        });
        break;
    }
  };

  changeAnnotationType(type) { //trigger function when the annotation type changes
    if (typeof (type) == "undefined" || type === null)
      this.annotationSchema.annotation_type = "";
    else
      this.annotationSchema.annotation_type = type;

    this.changeAttributeAlternative(null);

    switch (this.subheader) {
      case "Button Annotator":
        this.buttonAnnotatorService.getAnnotationAttributes(this.annotationSchema.language, this.annotationSchema.annotation_type)
          .then((data: any) => {
            this.annotationSchemaOptions.attributes = data.attributes;
          });
        break;
      case "Coreference Annotator":
        this.coreferenceAnnotatorService.getAttributeAlternatives(this.annotationSchema.language, this.annotationSchema.annotation_type)
          .then((data: any) => {
            this.annotationSchemaOptions.alternatives = data.alternatives;
          });
        break;
    }
  };

  // trigger function when the annotation attribute changes
  changeAnnotationAttribute(attr) {
    if (typeof (attr) == "undefined" || attr === null)
      this.annotationSchema.attribute = "";
    else
      this.annotationSchema.attribute = attr;

    this.changeAttributeAlternative(null);
    this.buttonAnnotatorService.getAttributeAlternatives(this.annotationSchema.language, this.annotationSchema.annotation_type, this.annotationSchema.attribute)
      .then((data: any) => {
        this.annotationSchemaOptions.alternatives = data.alternatives;
      });
  };

  //trigger function when the annotation attribute changes
  changeAttributeAlternative(attrAlt) {
    if (typeof (attrAlt) == "undefined" || attrAlt === null || attrAlt === "") {
      this.annotationSchema.alternative = "";
      this.emptyValuesArrays();
      return false;
    }
    else
      this.annotationSchema.alternative = attrAlt;

    switch (this.subheader) {
      case "Button Annotator":
        this.buttonAnnotatorService.getValues(this.annotationSchema.language,
          this.annotationSchema.annotation_type,
          this.annotationSchema.attribute,
          this.annotationSchema.alternative)
          .then((data: any) => {
            this.emptyValuesArrays();

            this.groups = _.cloneDeep(data.groups);

            this.groups.forEach((value) => {
              this.annotationSchemaOptions.values = this.annotationSchemaOptions.values.concat(value.values);
            });
          });
        break;
      case "Coreference Annotator":
        this.coreferenceAnnotatorService.getValues(this.annotationSchema.language,
          this.annotationSchema.annotation_type,
          this.annotationSchema.alternative)
          .then((data: any) => {
            this.emptyValuesArrays();

            this.attrs = _.cloneDeep(data.attributes);

            data.attributes.forEach((value) => {
              this.annotationSchemaOptions.attributes.push(value.attribute);
            });
          });
        break;
    }
  };

  compareFn(optionOne, optionTwo): boolean {
    return optionOne === optionTwo;
  }

  showSelected(sel) { //function to be called when a user clicks a document 
    if (typeof (sel) == "undefined")
      this.selectedDocument = {};
    else {//if (!('document_count' in sel)) {
      this.selectedDocument = sel["element"];
    }
  };

  selectDocument() { //function to validate which document has been selected, if any
    if (Object.keys(this.selectedDocument).length > 0) {
      this.flash = "";
      //let selectedCollection = $filter('filter')(this.dataForTheTree, { id: this.selectedDocument["collection_id"] }, true);

      this.selectedCollection = this.dataForTheTree.data.find(x => x.id == this.selectedDocument["collection_id"]);
      /* Is this a complete Document? Does it have name? */
      if (! ("name" in this.selectedDocument)) {
        var did = this.selectedDocument["id"];
        this.selectedDocument = this.selectedCollection.children.find(x => x.id == did);
      }
      this.documentSelectorHeight = 0;
      this.showSelectDocument = false;
      // console.error("SelectDocumentModalComponent: selectDocument():", this.selectedCollection, this.selectedDocument);
      // console.error("SelectDocumentModalComponent: selectDocument():", this.dataForTheTree.data);
      return true;
    } else {
      this.flashMessage.show("Please select a document from the list..", { cssClass: 'alert alert-warning', timeout: 2000 });
      return false;
    }
  };

  resetSchema() { //function to be called when a user decides to reset the current annotation schema
    var documentSelectionResponse = this.selectDocument();
    if (documentSelectionResponse) {
      if (typeof (this.annotationSchema) != "undefined") {
        this.annotationSchemaExists = false;
        this.showSelectDocument = false;
      }
    }
  };

  closeWithNewSchema() { //fuction to close the modal by setting a new annotation schema
    var userOptions = {
      newAnnotator: this.subheader,
      newAnnotationSchemaOptions: this.annotationSchemaOptions,
      newAnnotationSchema: this.annotationSchema,
      newCollection: this.selectedCollection,
      newDocument: this.selectedDocument
    };

    this.dialogRef.close(userOptions);
  };

  closeWithSameSchema() { //fuction to close the modal by setting the same annotation schema
    if (typeof (this.data.annotationSchema) != "undefined" && Object.keys(this.data.annotationSchema).length > 0) {
      var documentSelectionResponse = this.selectDocument();

      if (documentSelectionResponse) {
        var userOptions = {
          newAnnotator: this.data.annotator,
          newAnnotationSchemaOptions: this.annotationSchemaOptions,
          newAnnotationSchema: _.cloneDeep(this.data.annotationSchema),
          newCollection: this.selectedCollection,
          newDocument: this.selectedDocument
        };

        this.dialogRef.close(userOptions);
      }
    }
  };

  back() {
    this.showSelectDocument = true;
    this.documentSelectorHeight = 600;
  };

}
