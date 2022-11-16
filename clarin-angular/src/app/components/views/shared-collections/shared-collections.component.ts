import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, Input } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { SharedCollectionInformation, SharedCollectionsInformation } from '@models/collection';
import { BackendResultArray } from '@models/backend';

import { SharedCollectionsService } from '@services/shared-collections-service/shared-collections-service.service';
import { SharedCollectionService } from '@services/shared-collection/shared-collection.service';
import { ConfirmDialogComponent } from '@components/dialogs/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '@models/dialogs/confirm-dialog';

import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'manage-shared-collections',
  templateUrl: './shared-collections.component.html',
  styleUrls: ['./shared-collections.component.scss']
})
export class SharedCollectionsComponent implements OnInit, AfterViewInit {

  shared_by_me: SharedCollectionsInformation   = [];
  shared_with_me: SharedCollectionsInformation = [];
  displayedColumns: string[] = ["id", "collection_name", "from_email", "to_email", "confirmed", "actions"];
  pageSizeOptions = [5, 10, 20, 30, 40, 50];
  dataSource_shared_by_me   = new MatTableDataSource(this.shared_by_me);
  dataSource_shared_with_me = new MatTableDataSource(this.shared_with_me);

  @ViewChildren(MatSort)      sort     !:QueryList<MatSort>;
  @ViewChildren(MatPaginator) paginator!:QueryList<MatPaginator>;
  @Input() showPageHeader: boolean = true;

  constructor(
    private sharedCollectionsService: SharedCollectionsService,
    private sharedCollectionService: SharedCollectionService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  }; /* ngOnInit */

  ngAfterViewInit() {
    this.initialiseSharedCollectionsData();
  }; /* ngAfterViewInit */

  // Initialise the shared collections data
  initialiseSharedCollectionsData() {
    this.sharedCollectionsService.getSharedCollectionsInfo().then((response) => {
      if (!response["success"]) {
        this.toastrService.error(this.translateService.instant(response["message"]));
      } else {
        this.shared_by_me   = [...response.data.shared_by_me,   ...response.data.shared_by_me_pending].map((element, index) => {
          element['created_at_str'] = new Date(element.created_at);
          element['updated_at_str'] = new Date(element.updated_at);
          return element;
        });
        this.shared_with_me = [...response.data.shared_with_me, ...response.data.shared_with_me_pending].map((element, index) => {
          element['created_at_str'] = new Date(element.created_at);
          element['updated_at_str'] = new Date(element.updated_at);
          return element;
        });;
        this.dataSource_shared_by_me             = new MatTableDataSource(this.shared_by_me);
        this.dataSource_shared_with_me           = new MatTableDataSource(this.shared_with_me);
        this.dataSource_shared_by_me.sort        = this.sort.get(0);
        this.dataSource_shared_with_me.sort      = this.sort.get(1);
        this.dataSource_shared_by_me.paginator   = this.paginator.get(0);
        this.dataSource_shared_with_me.paginator = this.paginator.get(1);
      }
    });
  }; /* initialiseSharedCollectionsData */

  infoDialog(message="") {
    var modalOptions = new ConfirmDialogData();
    modalOptions.headerType  = "warning";
    modalOptions.dialogTitle = this.translateService.instant('Warning');
    modalOptions.message     = message;
    modalOptions.buttons     = ['No', 'Yes'];
    return this.dialog.open(ConfirmDialogComponent, { data: modalOptions });
  }; /* infoDialog */

  onDeleteSharing(element) {
    // console.error("SharedCollectionsComponent: onDeleteSharing():", element);
    var dialogRef = this.infoDialog(
      this.translateService.instant('Do you want to delete the invitation for the following Collection?') +
      "<ul><li>\"" + element.collection_name + "\"</li></ul>"
    );
    dialogRef.afterClosed().subscribe(modalResult => {
      switch (modalResult) {
        case "Yes":
          this.sharedCollectionService.destroy(element.collection_id, element.id).then((response) => {
            if (response['success']) {
                this.initialiseSharedCollectionsData();
                this.toastrService.info(this.translateService.instant("Invitation Deleted!"));
              }
            },(error) => {
              this.toastrService.error(error);
            });
          break;
        default:
          break;
      };
    });
  }; /* onDeleteSharing */

  onRevokeSharing(element, confirm=false) {
    // console.error("SharedCollectionsComponent: onRevokeSharing():", element);
    var dialogRef = this.infoDialog(
      this.translateService.instant('Do you want to revoke the invitation for the following Collection?') +
      "<ul><li>\"" + element.collection_name + "\"</li></ul>"
    );
    dialogRef.afterClosed().subscribe(modalResult => {
      switch (modalResult) {
        case "Yes":
          this.updateConfirmation(element, confirm);
          break;
        default:
          break;
      };
    });
  }; /* onRevokeSharing */

  onConfirmSharing(element:SharedCollectionInformation, confirm=true) {
    // console.error("SharedCollectionsComponent: onConfirmSharing():", element);
    var dialogRef = this.infoDialog(
      this.translateService.instant('Do you want to accept the invitation for the following Collection?') +
      "<ul><li>\"" + element.collection_name + "\"</li></ul>"
    );
    dialogRef.afterClosed().subscribe(modalResult => {
      switch (modalResult) {
        case "Yes":
          this.updateConfirmation(element, confirm);
          break;
        default:
          break;
      };
    });
  }; /* onConfirmSharing */

  updateConfirmation(element:SharedCollectionInformation, confirm=true) {
    var body:SharedCollectionInformation = {...element};
    body.confirmed = confirm;
    this.sharedCollectionsService.confirm(body).then((response) => {
      if (response.success) {
        this.initialiseSharedCollectionsData();
        this.toastrService.info(this.translateService.instant(response.data.confirmed ?
          "Invitation Accepted!" : "Invitation Revoked!"));
      }
    },(error) => {
      this.toastrService.error(error);
    });
  }; /* updateConfirmation */

}
