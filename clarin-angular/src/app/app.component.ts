import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PreloaderService, SettingsService } from '@core';
import ExportingModule from 'highcharts/modules/exporting';
// import SunsetTheme from 'highcharts/themes/sunset.js';
import * as Highcharts from 'highcharts';
// import packageJson from '../../package.json';

// The modules will work for all charts.
ExportingModule(Highcharts);
// SunsetTheme(Highcharts);

/*
 * Custom SVG as icons:
 * https://www.digitalocean.com/community/tutorials/angular-custom-svg-icons-angular-material
 */
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  // public title:   string = 'The Ellogon Annotation Platform';
  // public version: string = packageJson.version;

  constructor(private preloader: PreloaderService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private settings: SettingsService) {
    this.matIconRegistry.addSvgIcon(
      `logo_vast`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`/assets/images/logo-vast-01.svg`)
    );
  }; /* constructor */

  ngOnInit() {
    this.settings.setDirection();
    this.settings.setTheme();
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }
}
