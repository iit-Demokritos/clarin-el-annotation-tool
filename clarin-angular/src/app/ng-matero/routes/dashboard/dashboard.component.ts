import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { SettingsService } from '@core';
import { Subscription } from 'rxjs';

import { MainComponent } from 'src/app/components/views/main/main.component';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
    `
          .mat-mdc-raised-button {
            margin-right: 8px;
            margin-top: 8px;
          }
        `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardService],
})
export class DashboardComponent /*extends MainComponent*/ implements OnInit, AfterViewInit, OnDestroy {

  messages = this.dashboardSrv.getMessages();

  myStatistics         = this.dashboardSrv.getStatistics();
  mySharedStatistics   = this.dashboardSrv.getSharedStatistics();
  myUnsharedStatistics = this.dashboardSrv.getUnsharedStatistics();
  myTotalStatistics    = this.dashboardSrv.getTotalStatistics();

  notifySubscription!: Subscription;

  constructor(
    private ngZone: NgZone,
    private dashboardSrv: DashboardService,
    private settings: SettingsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  getUserStats() {
    this.dashboardSrv.getUserStatistics()
      .then((response) => {
        this.myStatistics[0].amount         = response.data.collections.toString();
        this.myStatistics[1].amount         = response.data.documents.toString();
        this.myStatistics[2].amount         = response.data.annotations.toString();
        this.myStatistics[3].amount         = response.data.annotations_by_me.toString();
        this.myStatistics[4].amount         = response.data.collections_user_shares.toString();
        /* Calculate progress... */
        let total_collections = response.data.collections + response.data.collections_shared;
        let total_annotations = response.data.annotations + response.data.annotations_shared + response.data.annotations_unshared;
        this.myStatistics[0].progress.value = response.data.collections / total_collections * 100;
        this.myStatistics[2].progress.value = response.data.annotations / response.data.annotations_total * 100;
        this.myStatistics[3].progress.value = response.data.collections_user_shares / response.data.collections * 100;
        if (response.data.annotations > 0) {
          this.myStatistics[3].progress.value = response.data.annotations_by_me / response.data.annotations * 100;
        } else {
          this.myStatistics[2].progress.value = 0;
          this.myStatistics[3].progress.value = 0;
        }
        
        this.mySharedStatistics[0].amount   = response.data.collections_shared.toString();
        this.mySharedStatistics[1].amount   = response.data.annotations_shared.toString();
        /* Calculate progress... */
        this.mySharedStatistics[0].progress.value = response.data.collections_shared / total_collections * 100;
        this.mySharedStatistics[1].progress.value = response.data.annotations_shared / response.data.annotations_total * 100;

        this.myUnsharedStatistics[0].amount = response.data.collections_unshared.toString();
        this.myUnsharedStatistics[1].amount = response.data.documents_unshared.toString();
        this.myUnsharedStatistics[2].amount = response.data.annotations_unshared.toString();
        /* Calculate progress... */
        this.myUnsharedStatistics[0].progress.value = response.data.collections_unshared / total_collections * 100;
        this.myUnsharedStatistics[2].progress.value = response.data.annotations_unshared / response.data.annotations_total * 100;

        this.myTotalStatistics[0].amount    = total_collections.toString();
        this.myTotalStatistics[1].amount    = response.data.annotations_total.toString();
        if (total_annotations > 0) {
          this.myTotalStatistics[1].progress.value = response.data.annotations_total / total_annotations * 100;
        } else {
          this.myTotalStatistics[1].progress.value = 0;
        }

        this.changeDetectorRef.detectChanges();
      }, (error) => {
        console.error(error);
      });
  };

  ngOnInit() {
    this.notifySubscription = this.settings.notify.subscribe(res => {
      console.log(res);
    }); 
  }

  ngAfterViewInit() {
    // this.ngZone.runOutsideAngular(() => this.initChart());
   this.getUserStats();
  }

  ngOnDestroy() {
    /*if (this.chart1) {
      this.chart1?.destroy();
    }
    if (this.chart2) {
      this.chart2?.destroy();
    }*/

    this.notifySubscription.unsubscribe();
  }
}
