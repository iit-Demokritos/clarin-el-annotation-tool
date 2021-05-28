import { DialogData } from "./dialog-data";
import {MatDialogConfig} from '@angular/material/dialog';

export class ConfirmDialogData extends MatDialogConfig<any> implements DialogData{
    dialogTitle: any;
    message: any;
    buttons:any[] = [];
    headerType:string;

    constructor(p_title:string="", p_message:string="", headerType = "", p_buttons = []){
        super();
        this.dialogTitle = p_title;
        this.message = p_message;
    }
}