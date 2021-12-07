import { Component, Input } from '@angular/core';

@Component({
  selector: 'annotation-detail',
  templateUrl: './annotation-detail.component.html',
  styleUrls: ['./annotation-detail.component.scss']
})
export class AnnotationDetailComponent {
  @Input() selectedAnnotationDataSource: any[];
  @Input() showHeader = true;
  selectedAannotationDisplayedColumns: string[] = ['name', 'value'];

}
