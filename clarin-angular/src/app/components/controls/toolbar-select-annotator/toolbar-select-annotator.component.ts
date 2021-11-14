import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { ErrorDialogData } from 'src/app/models/dialogs/error-dialog';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';

@Component({
  selector: 'toolbar-select-annotator',
  templateUrl: './toolbar-select-annotator.component.html',
  styleUrls: ['./toolbar-select-annotator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarSelectAnnotatorComponent extends MainComponent implements OnInit {
  @Input() fillWidth: boolean = true;
  @Input() annotators: String[] = [];
  selected_annotators: String | String[] = [];
  @Input() allowMultipleAnnotators: boolean = false;
  @Output() selectedAnnotators = new EventEmitter<String | String[]>();

  @Input() showApplyButton: boolean = false;
  @Input() ApplyButtonLabel: string = "Apply";
  @Output() onApply = new EventEmitter<String>();

  super() { }

  ngOnInit(): void {
  }

  onAnnotatorSelectionChange() {
    this.selectedAnnotators.emit(this.selected_annotators);
  }; /* onCollectionSelectionChange */

}
