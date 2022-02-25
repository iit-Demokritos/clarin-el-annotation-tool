import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'coref-del-btn',
  templateUrl: './coref-del-btn.component.html',
  styleUrls: ['./coref-del-btn.component.scss']
})
export class CorefDelBtnComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
  }

  deleteAttribute() {
    this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {});
  }

}
