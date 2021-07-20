import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'add-custom-value-modal',
  templateUrl: './add-custom-value-modal.component.html',
  styleUrls: ['./add-custom-value-modal.component.scss']
})
export class AddCustomValueModalComponent extends MainDialogComponent implements OnInit {

  public breakpoint: number; // Breakpoint observer code
  public addCustomValueForm: FormGroup;
  public value:string = "";
  public label:string = "";

  ngOnInit(): void {
    this.addCustomValueForm = this.formBuilder.group({
      value: [this.value, [Validators.required, Validators.pattern('[a-zA-Z0-9]+([a-zA-Z0-9_-]+)*')]],
      label: [this.label, [Validators.required, Validators.pattern('[a-zA-Z0-9]+([a-zA-Z0-9 _-]+)*')]]
    });
    this.breakpoint = window.innerWidth <= 600 ? 1 : 2; // Breakpoint observer code
  }

  addButton() {
    // console.error("addButton(): label:", this.label, "attribute:", this.value);
    if (this.label.length == 0 || this.value.length == 0) {
      this.markAsDirty(this.addCustomValueForm);
      return;
    }
    var customvalue = [{ attributes:[
      {label: this.label, value: this.value}
    ]}];
    this.TextWidgetAPI.setFoundInCollection(customvalue);

    this.dialogRef.close();
  } /* addButton */

  cancel() {
    this.dialogRef.close();
  }; /* cancel */

  private markAsDirty(group: FormGroup): void {
    group.markAsDirty();
    // tslint:disable-next-line:forin
    for (const i in group.controls) {
      group.controls[i].markAsDirty();
    }
  }

  public onResize(event: any): void {
    this.breakpoint = event.target.innerWidth <= 600 ? 1 : 2;
  }

}
