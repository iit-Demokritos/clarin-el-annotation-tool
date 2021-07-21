import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends MainComponent implements OnInit {

  statistics = [
    {
      title: 'Collections',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-indigo-500',
    },
    {
      title: 'Documents',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-blue-500',
    },
    {
      title: 'Annotations',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-green-500',
    },
  ];

  userStats = {
    collections: 0,
    documents: 0,
    annotations: 0
  };
  
  getUserStats() {
    this.userService.getStats()
      .then((response) => {
        this.userStats = response.data;
        this.statistics[0].amount = this.userStats.collections.toString();
        this.statistics[1].amount = this.userStats.documents.toString();
        this.statistics[2].amount = this.userStats.annotations.toString();
        this.changeDetectorRef.detectChanges();
      }, (error) => {
        console.error(error);
      });
  };

  ngOnInit() {
    this.getUserStats();
  }

}
