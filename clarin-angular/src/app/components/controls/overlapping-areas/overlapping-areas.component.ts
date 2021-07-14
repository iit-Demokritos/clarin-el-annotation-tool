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
  clearOverlappingAreasIgnore = false;

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerOverlappingAreasCallback(this.updateOverlappingAreasList.bind(this));
  }

  getAnnotationPresentableId(annotation) {
    return this.TextWidgetAPI.getAnnotationPresentableId(annotation);
  }; /* getAnnotationPresentableId */

  //function to be called when the overlapping areas update
  updateOverlappingAreasList() {
    var overlaps = this.TextWidgetAPI.getOverlappingAreas();
    if (this.clearOverlappingAreasIgnore && !overlaps.length) return;
    this.selectedOverlappingAnnotation = null;
    if (overlaps.length == 1) {
      // Select the overlap
      this.selectedOverlappingAnnotation = overlaps[0]
    } else if (overlaps.length > 1) {
      var selected = this.TextWidgetAPI.getSelectedAnnotation();
      if (!(typeof selected == "undefined" || selected == {})) {
        // Locate the selected annotation in the overlaps list
        this.selectedOverlappingAnnotation = overlaps.find(item => item._id == selected['_id']);
      }
    }
    this.overlaps = overlaps;
  }

  //function to be called when the user select annotation from the dropdown
  updateSelectedAnnotation(selectedAnnotation) {
    if (selectedAnnotation)
      this.clearOverlappingAreasIgnore = true;
      this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
      this.clearOverlappingAreasIgnore = false;
  }

}
