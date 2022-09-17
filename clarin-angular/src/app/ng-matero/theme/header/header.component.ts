import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { SettingsService, AppSettings } from '@core';
import screenfull from 'screenfull';

@Component({
  selector: 'app-header',
  host: {
    class: 'matero-header',
  },
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() showBranding = false;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();
  @Output() toggleSettingsPanel = new EventEmitter<void>();

  options;

  constructor() {}

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  receiveOptions(options: AppSettings): void {
    this.options = options;
  }
}
