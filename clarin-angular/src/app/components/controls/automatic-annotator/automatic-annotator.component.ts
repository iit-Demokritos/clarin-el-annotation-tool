import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '@components/controls/base-control/base-control.component';

@Component({
  selector: 'automatic-annotator',
  templateUrl: './automatic-annotator.component.html',
  styleUrls: ['./automatic-annotator.component.scss']
})
export class AutomaticAnnotatorComponent extends BaseControlComponent implements OnInit {

  autoAnnotatorSpecs = {};
  progress_mode = "indeterminate";
  progress_value = 0;

  super() { }
  
  ngOnInit(): void {
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.onDocumentChange.bind(this));
    this.progress_mode = "determinate";
  }

  onDocumentChange() {
    this.autoAnnotatorSpecs = this.TextWidgetAPI.getAnnotationSchemaAutoAnn();
  }

  callEndpoint(item) {
    this.progress_mode  = "determinate";
    this.progress_value = 0;
    var currentDocument = this.TextWidgetAPI.getCurrentDocument();
    if (!('id' in currentDocument)) {
      return;
    }
    this.autoannService.callAPIEndpoint(item.value, currentDocument)
    .then((response: any) => {
      var segments = response["data"];
      segments.forEach(segment => {
        var newAnnotation = {
          _id: this.ObjectId().toString(),
          document_id: currentDocument["id"],
          collection_id: currentDocument["collection_id"],
          annotator_id: currentDocument["annotator_id"],
          type: item.annotation,
          spans: [{
            segment: segment["segment"],
            start:   segment["starts"],
            end:     segment["ends"]
          }],
          attributes: [{
            name: item.attribute,
            value: segment["type"]
          }]
        };
	this.TextWidgetAPI.addAnnotation(newAnnotation);
      });
    }, (error) => {
      console.error("error:", error);
    });
    this.progress_value = 100;
  }

  onPreview(item) {
    this.callEndpoint(item);
  }

  onApply(item) {
    this.callEndpoint(item);
  }

}
