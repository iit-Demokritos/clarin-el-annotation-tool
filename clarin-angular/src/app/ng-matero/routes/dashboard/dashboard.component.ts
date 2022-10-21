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
import { DashboardService } from './dashboard.srevice';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
    `
      .mat-raised-button {
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
	
	this.mySharedStatistics[0].amount   = response.data.collections_shared.toString();
        this.mySharedStatistics[1].amount   = response.data.documents_shared.toString();
        this.mySharedStatistics[2].amount   = response.data.annotations_shared.toString();

	this.myUnsharedStatistics[0].amount = response.data.collections_unshared.toString();
        this.myUnsharedStatistics[1].amount = response.data.documents_unshared.toString();
        this.myUnsharedStatistics[2].amount = response.data.annotations_unshared.toString();

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
