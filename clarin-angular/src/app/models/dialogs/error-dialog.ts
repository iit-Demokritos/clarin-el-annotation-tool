import { MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogData } from "./dialog-data";

export class ErrorDialogData extends MatDialogConfig<any> implements DialogData {
  dialogTitle: any;
  message: any;
  data: any;
  buttons: string[] = [];
  headerType: string;

  constructor(translate: TranslateService, p_message: string = "",
    p_headerType = "error", p_buttons = [], p_data: any = {}) {
    super();
    this.dialogTitle = translate.instant("ErrorMessage.Error");
    this.message = translate.instant('ErrorMessage.' + p_message);
    this.data = p_data;
    this.buttons = p_buttons;
    this.headerType = p_headerType;
  }
}
