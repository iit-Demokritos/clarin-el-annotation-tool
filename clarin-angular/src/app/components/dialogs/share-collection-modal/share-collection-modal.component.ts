import { Component, OnInit } from '@angular/core';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'share-collection-modal',
  templateUrl: './share-collection-modal.component.html',
  styleUrls: ['./share-collection-modal.component.scss']
})
export class ShareCollectionModalComponent extends MainDialogComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.initializeSharingData();
  }

  invitations = [];
  sharingData = {
    "cname": this.data.collectionName,
    "cid": this.data.collectionId,
    "to": ""
  }

  initializeSharingData() {				//initialize the collections tree
    this.sharedCollectionService.getAll(this.data.collectionId).then((response) => {
      if (!response["success"]) {

        this.flashMessage.show("Error during the restoring of your collections. Please refresh the page and try again.", { cssClass: 'alert alert-danger', timeout: 2000 });
      } else {
        this.invitations = response["data"];
      }
    })
  }

  share() {
    this.sharedCollectionService.save(this.sharingData.cid, this.sharingData)
      .then((response) => {
        if (response["success"]) {
          this.sharingData.to = "";
          this.initializeSharingData();
        } else
          this.flashMessage.show(response["message"], { cssClass: 'alert alert-danger', timeout: 2000 });
      }, (error) => {
        /*$scope.$destroy();
        $modalInstance.close();
        var modalOptions = { body: 'Error in share collection. Please refresh the page and try again' };
        Dialog.error(modalOptions);*/
        this.flashMessage.show("Error in share collection. Please refresh the page and try again", { cssClass: 'alert alert-danger', timeout: 2000 });
      });
  };

  remove(collectionId, invitationId) {
    this.sharedCollectionService.destroy(collectionId, invitationId)
      .then((response) => {
        if (response["success"]) {
          this.initializeSharingData();
        } else {
          this.flashMessage.show(response["message"], { cssClass: 'alert alert-danger', timeout: 2000 });
        }
      }, (error) => {
        /*
        $scope.$destroy();
        $modalInstance.close();
        var modalOptions = { body: 'Error in share collection. Please refresh the page and try again' };
        Dialog.error(modalOptions);*/
        this.flashMessage.show("Error in share collection. Please refresh the page and try again", { cssClass: 'alert alert-danger', timeout: 2000 });
      });
  };

  cancel() {
    this.dialogRef.close();
  };

}
