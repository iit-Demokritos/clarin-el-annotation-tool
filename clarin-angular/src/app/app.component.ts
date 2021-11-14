import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PreloaderService } from '@core';
import ExportingModule from 'highcharts/modules/exporting';
// import SunsetTheme from 'highcharts/themes/sunset.js';
import * as Highcharts from 'highcharts';

// The modules will work for all charts.
ExportingModule(Highcharts);
// SunsetTheme(Highcharts);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'clarin-angular';

  constructor(private preloader: PreloaderService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.preloader.hide();
  }
}
