import { Component, Input } from '@angular/core';
import PhotoViewer from 'photoviewer';

/*
 * Based on ng-matero media gallery:
 * https://github.com/ng-matero/ng-matero/tree/main/src/app/routes/media/gallery
 */

@Component({
  selector: 'app-media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent {

  @Input() images: any[] = [];

  // Preview images
  preview(index: number) {
    const options: PhotoViewer.Options = { index };
    const viewer = new PhotoViewer(this.images, options);
  }
}
