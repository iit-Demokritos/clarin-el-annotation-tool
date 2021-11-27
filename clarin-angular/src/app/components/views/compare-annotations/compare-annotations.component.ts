import { AfterViewInit, Component, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'app-compare-annotations',
  templateUrl: './compare-annotations.component.html',
  styleUrls: ['./compare-annotations.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CompareAnnotationsComponent extends MainComponent implements OnInit, AfterViewInit {
  @Input() showPageHeader: boolean = true;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;
  @Input() showAnnotatorSelectionToolbar: boolean = true;
  annotations: any[] = [];
  apply=false
  result={}
  selectedCollection   = {};
  selectedDocument     = {};
  selectedDocumentId:number=0;
  annotators            = [];
  selectedAnnotators    = [];
  selectedAnnotatorsIds= [];
  schemaValues          = {};

  match = {
    document_id:           this.selectedDocumentId ,
    type:                  {$nin: ["setting annotation"] },
    document_setting:     { $exists: false },
    collection_setting:   { $exists: false },
    document_attribute:   { $exists: false },
    collection_attribute: { $exists: false }
  };


  super() { }

 
  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
   
  }

  onCollectionsChange(event) {
    this.selectedCollection = event;
   // console.log(event)
    this.selectedDocument   = {}
    this.selectedDocumentId = 0;
    this.apply=false
    this.result={}
  }

  onDocumentsChange(event) {
    this.selectedDocument     = event;
    //console.log(event)
    this.selectedDocumentId   =event.id
    this.match.document_id = this.selectedDocumentId;
    this.getAnnotatorSchemas();
    this.apply=false
    this.result={}
  }


  getAnnotatorSchemas() {
    if (this.selectedDocumentId==0) {
      this.annotators = [];
      return;
    }
    var group = {
      _id:  "$annotator_id",
      count: {$sum : 1}
    };
    this.analyticsService.aggregate([
      { $match:   this.match },
      { $group:   group },
      { $sort : { count : -1, _id: 1 } }
    ])
    .then((response) => {
      if (response["success"]) {
        this.annotators = response['data'].map((obj) => {
          obj['name'] = obj['_id'];
          return obj;
        });
      } else {
        this.annotators= [];
      }
    }, (error) => {
      this.annotators = [];
    });
  }




  

  onAnnotatorsChange(event) {
    this.selectedAnnotators = event;
    this.selectedAnnotatorsIds = this.selectedAnnotators.map(obj => obj['_id'])
    if (this.selectedAnnotatorsIds.length) {
      this.match['annotator_id'] = { $in: this.selectedAnnotatorsIds };
    } else {
      delete this.match['annotator_id'];
    }
    this.getAnnotatorSchemaValues();
  }


  

  getAnnotatorSchemaValues() {
    this.schemaValues = {};
    for (var id of this.selectedAnnotatorsIds) {
      var schema = this.TextWidgetAPI.getAnnotationSchemaFromAnnotatorTypeId(id);
      var type   = this.TextWidgetAPI.getAnnotatorTypeFromAnnotatorTypeId(id);
      this.result["newAnnotator"]=type
      this.result["newAnnotationSchema"]=schema
      this.result["newAnnotationSchemaOptions"]={}
     // this.result["newAnnotationSchemaOptions"]=this.TextWidgetAPI.getAnnotationSchemaOptionsbyId()
      if (type == "Button Annotator") {
        this.buttonAnnotatorService.getLanguages().then((response) => {
          console.log(this.result["newAnnotationSchemaOptions"])
          this.result["newAnnotationSchemaOptions"].languages=response["languages"]
        })
        this.buttonAnnotatorService.getAnnotationTypes(schema.language).then((response)=>{
          this.result["newAnnotationSchemaOptions"].annotation_types=response["annotation_types"]
        })
        this.buttonAnnotatorService.getAnnotationAttributes(schema.language,schema.annotation_type).then((response)=>{
            console.log(response)
            this.result["newAnnotationSchemaOptions"].attributes=response["attributes"]
        })
        this.buttonAnnotatorService.getAttributeAlternatives(schema.language,schema.annotation_type,schema.attribute).then((response)=>{
              console.log(response)
              this.result["newAnnotationSchemaOptions"].alternatives=response["alternatives"]
        })
        this.buttonAnnotatorService.getValues(schema.language,
          schema.annotation_type, schema.attribute, schema.alternative)
        .then((response) => {
          console.log(response)
          var schemavalues=[]
           for (var g of response['groups']) {
             var values = g['values'];
             schemavalues=schemavalues.concat(values)
             //console.log(schemavalues)
             var labels = g['labels'];
             var descrs = g['descriptions'];
             for (var i = 0; i < values.length; i++) {
               this.schemaValues[values[i]] = {
                 group: g['group'],
                 label: ((labels[i]) ? labels[i] : descrs[i])
               }
             }
           }
           this.result["newAnnotationSchemaOptions"].values=schemavalues
        });
      } else if (type == "Coreference Annotator") {
        this.coreferenceAnnotatorService.getValues(schema.language,
          schema.annotation_type, schema.alternative);
      }
    }
  }

  onApply(event) {
    this.apply=true
    //let criteria=this.match
    this.analyticsService.find(this.match,null)
    .then((response) => {
      if (response["success"]) {
        console.log(response)
        this.annotations=response["data"]
    
      } else {
        this.annotators= [];
      }
    }, (error) => {
      this.annotators = [];
    });
  }
}
