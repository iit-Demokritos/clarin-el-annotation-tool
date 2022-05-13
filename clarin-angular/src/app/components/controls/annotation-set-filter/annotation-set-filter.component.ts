import { Component, EventEmitter, Input, Output, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { AnalyticsService } from 'src/app/services/analytics-service/analytics.service';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';
import { Annotation } from 'src/app/models/annotation';

import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'annotation-set-filter',
  templateUrl: './annotation-set-filter.component.html',
  styleUrls: ['./annotation-set-filter.component.scss'],
  // According to: https://stackoverflow.com/questions/60521315/how-to-replace-an-injected-service-in-angular-template-when-using-from-other-com
  // This will inject a new object of TextWidgetAPI instead of reusing the same shared object
  // providers: [{provide: TextWidgetAPI, useClass: TextWidgetAPI}],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: AnnotationSetFilterComponent, multi: true }
  ]
})
export class AnnotationSetFilterComponent implements ControlValueAccessor, AfterViewInit {
  // public queryCtrl: FormControl;

  public default_query = {condition: 'and', rules: []};

  public config: QueryBuilderConfig = {
    fields: {
      annotator:  {name: 'Annotator',          type: 'category', options: []},
      type:       {name: 'Type',               type: 'category', options: []},
      attribute:  {name: 'Attribute',          type: 'category', options: []},
      value:      {name: 'Attribute Value',    type: 'category', options: []},
      doc_attr:   {name: 'Document Attribute', type: 'category', options: []},
      created_by: {name: 'Created by',         type: 'category', options: []},
      updated_by: {name: 'Updated by',         type: 'category', options: []}
    }
  };

  private _query = {...this.default_query};
  set query(val) {
    this._query = val;
    this.onQueryChange();
    this.handleDataChange();
    this.change.emit(this.query);
  };
  get query() {return this._query;}
  public mongoQuery;

  public allowRuleset: boolean              = true;
  public allowCollapse: boolean             = true;
  public persistValueOnFieldChange: boolean = false;
  public disabled = true;

  @Input()  ignoreQueryModelChangeEventsNumber: number = 1;
  @Input()  fillWidth: boolean = true;
  @Input()  showApplyButton: boolean = false;
  @Input()  ApplyButtonLabel: string = "Apply";
  /* Detect changes in "collections" by defining it as a property */
  private   _collections: Collection[];
  @Input()  set collections(val: Collection|Collection[]) {
    if (Array.isArray(val)) {
      this._collections = val;
    } else if (Object.keys(val).length) {
      this._collections = [val];
    } else {
      this._collections = [];
    }
    this.onCollectionsChange();
  }
  get collections(): Collection[] { return this._collections; }
  /* Detect changes in "documents" by defining it as a property */
  private   _documents: Document[];
  @Input()  set documents(val: Document|Document[]) {
    if (Array.isArray(val)) {
      this._documents = val;
    } else if (Object.keys(val).length) {
      this._documents = [val];
    } else {
      this._documents = [];
    }
    this.onDocumentsChange();
  }
  get documents(): Document[] { return this._documents; }
  selectedDocumentIds: number[] = [];

  @Output() onApply      = new EventEmitter<any>();
  @Output() mongoDBQuery = new EventEmitter<any>();
  @Output() change       = new EventEmitter<any>();
  @Output() valid        = new EventEmitter<boolean>();
  applyDisabled = true;
  emittedApplyDisabled = true;

  super() { }
 
  constructor(
    private formBuilder: FormBuilder,
    private analyticsService: AnalyticsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    // this.queryCtrl = this.formBuilder.control(this.query);
    this.disabled = true;
  }

  ngAfterViewInit(): void {
  }

  onQueryModelChange(event) {
    console.error("HANDLER:", event, this.ignoreQueryModelChangeEventsNumber, this.query)
    if (this.ignoreQueryModelChangeEventsNumber) {
      this.ignoreQueryModelChangeEventsNumber--;
    } else {
      this.query = event;
    }
    console.error("CONFIG:", this.config);
  }

  onCollectionsChange() {
    this.selectedDocumentIds = [];
    this.disabled = true;
  }; /* onCollectionChange */

  onDocumentsChange() {
    this.selectedDocumentIds = this.documents.map(obj => obj.id);
    this.disabled            = this.selectedDocumentIds.length == 0;
    this.query               = {...this.default_query};

    this.analyticsService.getAnnotatorSchemas(this.selectedDocumentIds)
    .then((annotators: any[]) => {
      this.config.fields.annotator.options =
        annotators.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.detectChanges(); // forces change detection to run
    });
    this.analyticsService.getAnnotationTypes(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.type.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.getAnnotationAttributes(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.attribute.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.getAnnotationAttributeValues(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.value.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.getDocumentAttributes(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.doc_attr.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.getAnnotationCreators(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.created_by.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.getAnnotationUpdaters(this.selectedDocumentIds)
    .then((values: any[]) => {
      this.config.fields.updated_by.options =
        values.map(obj => {
          return {name: obj.name + ' (' + obj.count + ' Annotations)', value: obj._id};
      });
      // this.changeDetectorRef.markForCheck();
    });
    // this.changeDetectorRef.markForCheck();
  }; /* onDocumentChange */

  onQueryChange() {
    this.applyDisabled = !this.queryValid(this.query) || this.selectedDocumentIds.length == 0;
    if (this.applyDisabled) {
      this.mongoQuery = undefined;
    } else {
      // this.mongoQuery = this.mapRuleSet(this.query);
      let mq = this.mapRuleSet(this.query);
      if (mq) {
        // We have a query...
        if ('$and' in mq) {
          mq['$and'].push({
            document_id: (Array.isArray(this.selectedDocumentIds) ?
              { $in: this.selectedDocumentIds } : this.selectedDocumentIds)
          });
          mq['$and'].push({type:                 { $nin: ["setting annotation"] }});
          mq['$and'].push({document_setting:     { $exists: false }});
          mq['$and'].push({collection_setting:   { $exists: false }});
          this.mongoQuery = mq;
        } else {
          this.mongoQuery = {
            $and: [
              {document_id: (Array.isArray(this.selectedDocumentIds) ?
                { $in: this.selectedDocumentIds } : this.selectedDocumentIds)},
              {type:                 { $nin: ["setting annotation"] }},
              {document_setting:     { $exists: false }},
              {collection_setting:   { $exists: false }},
              mq
            ]
          };
        }
      } else {
        // We do not have a query...
        this.mongoQuery = {
          document_id:        (Array.isArray(this.selectedDocumentIds) ?
                                { $in: this.selectedDocumentIds } :
                                  this.selectedDocumentIds),
          type:                 { $nin: ["setting annotation"] },
          document_setting:     { $exists: false },
          collection_setting:   { $exists: false }
        };
      }
      this.mongoDBQuery.emit(this.mongoQuery);
    }
    if (this.emittedApplyDisabled != this.applyDisabled) {
      this.emittedApplyDisabled = this.applyDisabled;
      this.valid.emit(!this.applyDisabled);
    }
  }; /* onQueryChange */

  queryRuleValid(rule) {
    if ('field' in rule) {
      if (!('operator' in rule)) return false;
      if (!('value'    in rule)) return false;
      if (Array.isArray(rule.value)) return rule.value.every(val => val != null);
      return rule.value != null;
    } else if ('rules' in rule) {
      return this.queryValid(rule.rules);
    }
    return false;
  }; /* queryRuleValid */

  queryValid(query) {
    // Do we have a condition?
    if (query == null || !('condition' in query)) {return false;}
    return query.rules.every(rule => this.queryRuleValid(rule));
  }; /* queryValid */

  /*
   * The following code was based on:
   * https://stackoverflow.com/questions/57259343/convert-query-builder-conditions-to-mongodb-operations-including-nested-array-of
   */
  conditions = { "and": "$and", "or": "$or" };
  operators = {
    "=": "$eq",
    "!=": "$ne",
    "<": "$lt",
    "<=": "$lte",
    ">": "$gt",
    ">=": "gte",
    "in": "$in",
    "not in": "$nin",
    "contains": "$regex"
  };
  fields = {
    annotator:  "annotator_id",
    type:       "type",
    attribute:  "attributes.name",
    value:      "attributes.value",
    doc_attr:   "document_attribute",
    created_by: "created_by",
    updated_by: "updated_by"
  };

  getSchemaType(field) {
    return '';
  }; /* getSchemaType */

  // Map each rule to a MongoDB query
  mapRule(rule) {
    let field = this.fields[rule.field];
    let value = rule.value;
    if (!value) {
      value = null;
    }

    // Get schema type of current field
    let schemaType = this.getSchemaType(rule.field);

    /*
    // Check if schema type of current field is ObjectId
    if (schemaType === 'ObjectID' && value) {
      // Convert string value to MongoDB ObjectId
      if (Array.isArray(value)) {
        value.map(val => new ObjectId(val));
      } else {
        value = new ObjectId(value);
      }
    // Check if schema type of current field is Date
    } else if (schemaType === 'Date' && value) {
      // Convert string value to ISO date
      value = new Date(value);
    }
   */

    // Set operator
    let operator = this.operators[rule.operator] ? this.operators[rule.operator] : '$eq';

    // Create a MongoDB query
    let mongoDBQuery;

    // Check if operator is $regex
    if (operator === '$regex') {
      // Set case insensitive option
      mongoDBQuery = {
        [field]: {
          [operator]: value,
          '$options': 'i'
        }
      };
    } else {
      mongoDBQuery = { [field]: { [operator]: value } };
    }

    return mongoDBQuery;
  }; /* mapRule */

  mapRuleSet(ruleSet) {
    if (ruleSet.rules.length < 1) {
      return;
    }

    // Iterate Rule Set conditions recursively to build database query
    return {
      [this.conditions[ruleSet.condition]]: ruleSet.rules.map(
        rule => (rule.operator) ? this.mapRule(rule) : this.mapRuleSet(rule)
      )
    };
  }; /* mapRuleSet */

  /*
   * ngModel implementation (ControlValueAccessor)
   * Code from: https://unicorn-utterances.com/posts/angular-components-control-value-accessor
   */
  writeValue(value: any) {
    this.query = value;
  }; /* writeValue */

  // For ControlValueAccessor interface
  public onChangeCallback:  (_: any) => void = () => {};
  public onTouchedCallback: ()       => void = () => {};

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  private handleDataChange(): void {
    this.changeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback(this._query);
    }
  }
}
