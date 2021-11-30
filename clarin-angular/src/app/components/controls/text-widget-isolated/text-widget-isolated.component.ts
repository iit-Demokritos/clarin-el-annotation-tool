import { Component, ViewEncapsulation } from '@angular/core';
import { TextWidgetComponent } from '../text-widget/text-widget.component';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';


@Component({
  selector: 'text-widget-isolated',
  templateUrl: './text-widget-isolated.component.html',
  styleUrls: ['./text-widget-isolated.component.scss'],
  // According to: https://stackoverflow.com/questions/60521315/how-to-replace-an-injected-service-in-angular-template-when-using-from-other-com
  // This will inject a new object of TextWidgetAPI instead of reusing the same shared object
  providers: [{provide: TextWidgetAPI, useClass: TextWidgetAPI}],
  encapsulation: ViewEncapsulation.None
})
export class TextWidgetIsolatedComponent extends TextWidgetComponent {

}
