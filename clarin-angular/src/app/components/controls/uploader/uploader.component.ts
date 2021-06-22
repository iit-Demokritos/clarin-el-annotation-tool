import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FlowDirective, Transfer } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';
import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent extends BaseControlComponent implements OnInit {
  
  @ViewChild('flowAdvanced')
  flow: FlowDirective;
  autoUploadSubscription: Subscription;
  autoupload = true;
  filterFiles = false;

  @Input() files:any[] = [];
  userFiles:any[] = [];
  unsupportedFiles:any[] = [];
  @Output() handleFileInputs = new EventEmitter<any>();

  super() { }

  ngOnInit(){
  }

  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {
      
      if (event.type === 'fileRemoved') {
        for(var i=0;i<this.userFiles.length;i++){
          if(this.userFiles[i]["file"].name == event.event["file"].name){
            this.userFiles.splice(i,1);
            break;
          }
        }
      }
      else if (this.autoupload && (event.type === 'fileAdded')) {
        
        if(event.event[0]["file"].type != "text/plain"){
           let fEvent = event.event[1] as Event;
           fEvent.stopPropagation();
           fEvent.preventDefault();
           this.unsupportedFiles.push(event.event[0]["file"]);
        }else{
          this.userFiles.push(event.event[0]);
        }

      }
      else if (this.autoupload && event.type === 'filesSubmitted') {

        let message:string = "";
        if(this.unsupportedFiles.length == 1){
          message = "The file " + this.unsupportedFiles[0].name;
          message+=" is not supported.";
        }else if(this.unsupportedFiles.length > 1){
          message = "The files";
          this.unsupportedFiles.forEach(element =>{
            message+= " '" +element.name +"',";
          });
          
          message = message.substring(0,message.length-1);
          message+=" are not supported.";
        }

        this.unsupportedFiles = [];
        
        let fileObj = [];
        this.userFiles.forEach(element=>{
          fileObj.push(element["file"]);
        })

        this.files = fileObj;
        this.handleFileInputs.emit({files:fileObj,message:message});

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
