import { DialogData } from "./dialog-data";
import { MatDialogConfig } from '@angular/material/dialog';

export class RenameDialogData extends MatDialogConfig<any> implements DialogData{
    message: any;
    dialogTitle: any;
    data:any;
    
    constructor(p_data:any){
        super();
        this.data = p_data; 
    }
}
