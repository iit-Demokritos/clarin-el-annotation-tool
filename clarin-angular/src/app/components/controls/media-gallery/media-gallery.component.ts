import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import PhotoViewer from 'photoviewer';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';

/*
 * Based on ng-matero media gallery:
 * https://github.com/ng-matero/ng-matero/tree/main/src/app/routes/media/gallery
 */

@Component({
  selector: 'app-media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit {

  @Input() images: any[] = [];
  @Output() selected = new EventEmitter<any[]>();

  selection = new SelectionModel<any>(
    true, // <- multi-select
    [], // <- Initial selections
    true, // <- emit an event on selection change
    (otherValue, value) => otherValue.id === value.id);

  ngOnInit() {
    this.selection.changed.subscribe((change: SelectionChange<any>) => {
      this.selected.emit(this.selection.selected);
    });
  }; /* ngOnInit */

  // Preview images
  preview(index: number) {
    const options: PhotoViewer.Options = { index };
    const viewer = new PhotoViewer(this.images, options);
  }

  clear() {
    this.selection.clear(true);
  }; /* clear */

  isSelected(item: any) {
    return this.selection.isSelected(item);
  }; /* isSelected */

  toggle(item: any) {
    return this.selection.toggle(item);
  }; /* toggle */

}
