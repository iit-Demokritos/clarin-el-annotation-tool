import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FlowDirective, Transfer } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';
import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent extends BaseControlComponent implements OnInit, OnChanges {

  @ViewChild('flowAdvanced')
  flow: FlowDirective;
  autoUploadSubscription: Subscription;
  autoupload = true;
  filterFiles = true;

  @Input() files: any[] = [];
  userFiles: any[] = [];
  unsupportedFiles: any[] = [];
  @Input() fileEncodingOptions;
  defaultEncodingIndex = 0;
  @Input() fileHandlerOptions;
  defaultHandlerIndex = 0;
  @Input() allowedTypes = ["text/plain"];
  @Input() fileTypeOptions;
  defaultTypeIndex = 0;
  @Input() collectionData;
  @Input() collectionDataUpdated;
  @Input() flowAttributes: any = { accept: this.allowedTypes };

  @Output() handleFileInputs = new EventEmitter<any>();

  super() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'collectionDataUpdated': {
            //let change = changes[propName];
            //this.collectionData = change.currentValue;
            this.defaultEncodingIndex =
              this.fileEncodingOptions.indexOf(this.collectionData.encoding);
            this.defaultHandlerIndex =
              this.fileHandlerOptions.indexOf(this.collectionData.handler);
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {

      // console.error("UploaderComponent: event():", event);
      if (event.type === 'fileRemoved') {
        for (var i = 0; i < this.userFiles.length; i++) {
          if (this.userFiles[i]["file"].name == event.event["file"].name) {
            this.userFiles.splice(i, 1);
            break;
          }
        }
      }
      else if (this.autoupload && (event.type === 'fileAdded')) {
        if (!this.allowedTypes.includes(event.event[0]["file"].type)) {
          let fEvent = event.event[1] as Event;
          fEvent.stopPropagation();
          fEvent.preventDefault();
          this.unsupportedFiles.push(event.event[0]["file"]);
        } else {
          // Guess the type...
          this.defaultTypeIndex = this.allowedTypes.indexOf(event.event[0]["file"].type);
          if (event.event[0]["file"].type == "text/xml") {
            this.defaultHandlerIndex = this.fileHandlerOptions.findIndex(function (item, index) {
              if (item.name == 'TEI XML Import') return true;
            });
          }
          event.event[0]["ftype"] = this.fileTypeOptions === undefined ?
            undefined : this.fileTypeOptions[this.defaultTypeIndex];
          event.event[0]["handler"] = this.fileHandlerOptions === undefined ?
            undefined : this.fileHandlerOptions[this.defaultHandlerIndex];
          event.event[0]["encoding"] = this.fileEncodingOptions === undefined ?
            undefined : this.fileEncodingOptions[this.defaultEncodingIndex];
          this.userFiles.push(event.event[0]);
        }

      }
      else if (this.autoupload && event.type === 'filesSubmitted') {
        let message: string = "";
        if (this.unsupportedFiles.length == 1) {
          message = "The file " + this.unsupportedFiles[0].name;
          message += " is not supported.";
        } else if (this.unsupportedFiles.length > 1) {
          message = "The files";
          this.unsupportedFiles.forEach(element => {
            message += " '" + element.name + "',";
          });
          message = message.substring(0, message.length - 1);
          message += " are not supported.";
        }
        this.unsupportedFiles = [];

        let fileObj = [];
        this.userFiles.forEach(element => {
          fileObj.push({
            'file': element["file"],
            'name': element["name"],
            'type': element["ftype"],
            'encoding': element["encoding"],
            'handler': element["handler"]
          });
        })
        this.files = fileObj;
        this.handleFileInputs.emit({ files: fileObj, message: message });
        this.flow.cancel();
      }
    });
  }

  ngOnDestroy() {
    this.autoUploadSubscription.unsubscribe();
  }

  trackTransfer(transfer: Transfer) {
    return transfer.id;
  }

  fileHandler(files: any) {
    this.userFiles = files;
    this.handleFileInputs.emit(files)
  }
}
