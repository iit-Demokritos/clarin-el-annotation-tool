import { Component, OnInit, AfterViewInit, QueryList, ViewChildren, Input } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { SharedCollectionInformation, SharedCollectionsInformation } from '@models/collection';
import { BackendResultArray } from '@models/backend';

import { SharedCollectionsService } from '@services/shared-collections-service/shared-collections-service.service';


@Component({
  selector: 'manage-shared-collections',
  templateUrl: './shared-collections.component.html',
  styleUrls: ['./shared-collections.component.scss']
})
export class SharedCollectionsComponent implements OnInit, AfterViewInit {

  shared_by_me: SharedCollectionsInformation   = [];
  shared_with_me: SharedCollectionsInformation = [];
  displayedColumns: string[] = ["id", "collection_name", "from_email", "to_email", "confirmed"];
  pageSizeOptions = [5, 10, 20, 30, 40, 50];
  dataSource_shared_by_me   = new MatTableDataSource(this.shared_by_me);
  dataSource_shared_with_me = new MatTableDataSource(this.shared_with_me);

  @ViewChildren(MatSort)      sort     !:QueryList<MatSort>;
  @ViewChildren(MatPaginator) paginator!:QueryList<MatPaginator>;
  @Input() showPageHeader: boolean = true;

  constructor(
    private sharedCollectionsService: SharedCollectionsService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
  }; /* ngOnInit */

  ngAfterViewInit() {
    this.initialiseSharedCollectionsData();
  }; /* ngAfterViewInit */

  // Initialize the shared collections data
  initialiseSharedCollectionsData() {
    this.sharedCollectionsService.getSharedCollectionsInfo().then((response) => {
      if (!response["success"]) {
        this.toastrService.error(this.translateService.instant(""));
      } else {
        this.shared_by_me   = [...response.data.shared_by_me,   ...response.data.shared_by_me_pending];
        this.shared_with_me = [...response.data.shared_with_me, ...response.data.shared_with_me_pending];
        this.dataSource_shared_by_me             = new MatTableDataSource(this.shared_by_me);
        this.dataSource_shared_with_me           = new MatTableDataSource(this.shared_with_me);
        this.dataSource_shared_by_me.sort        = this.sort.get(0);
        this.dataSource_shared_with_me.sort      = this.sort.get(1);
        this.dataSource_shared_by_me.paginator   = this.paginator.get(0);
        this.dataSource_shared_with_me.paginator = this.paginator.get(1);
      }
    });
  }

}
