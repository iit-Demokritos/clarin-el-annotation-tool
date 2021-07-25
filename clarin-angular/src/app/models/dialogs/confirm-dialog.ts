import { DialogData } from "./dialog-data";
import { MatDialogConfig } from '@angular/material/dialog';

export class ConfirmDialogData extends MatDialogConfig<any> implements DialogData {
  dialogTitle: any;
  message: any;
  data: any;
  buttons: string[] = [];
  headerType: string;

  constructor(p_title: string = "", p_message: string = "",
    p_headerType = "alert", p_buttons = [], p_data: any = {}) {
    super();
    this.dialogTitle = p_title;
    this.message = p_message;
    this.data = p_data;
    this.buttons = p_buttons;
    this.headerType = p_headerType;
  }
}
