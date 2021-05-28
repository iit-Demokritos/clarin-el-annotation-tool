import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'overlapping-areas',
  templateUrl: './overlapping-areas.component.html',
  styleUrls: ['./overlapping-areas.component.scss']
})
export class OverlappingAreasComponent extends BaseControlComponent implements OnInit {

  overlaps = [];
  selectedOverlappingAnnotation;

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerOverlappingAreasCallback(this.updateOverlappingAreasList);
  }

  //function to be called when the overlapping areas update
  updateOverlappingAreasList() {
    this.overlaps = this.TextWidgetAPI.getOverlappingAreas();
    this.selectedOverlappingAnnotation = null;
  }

  //function to be called when the user select annotation from the dropdown
  updateSelectedAnnotation(selectedAnnotation) {
    if (selectedAnnotation)
      this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
  }

}
