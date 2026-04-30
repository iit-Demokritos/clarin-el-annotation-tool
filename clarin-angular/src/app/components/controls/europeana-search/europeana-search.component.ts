import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { EuropeanaService } from '@services/europeana-service/europeana.service';
import { ItemsEntity } from "@models/services/europeana";
import { PageEvent } from '@angular/material/paginator';
import { MediaGalleryComponent } from '@components/controls/media-gallery/media-gallery.component';

@Component({
  selector: 'app-europeana-search',
  templateUrl: './europeana-search.component.html',
  styleUrls: ['./europeana-search.component.scss']
})
export class EuropeanaSearchComponent {

  @ViewChild(MediaGalleryComponent) gallery: MediaGalleryComponent;
  @Output() selected = new EventEmitter<ItemsEntity[]>();

  // searchQuery = "Sophocles Antigone";
  searchQuery: string;
  images: ItemsEntity[] = [];
  selectedImages: ItemsEntity[] = [];
  totalResults: number = 0;
  rows: number = 4;
  pageIndex = 0;
  pageSizeOptions: number[] = [4, 8, 12, 24, 48, 100];

  showFirstLastButtons = false;

  nextCursor: { [pageIndex: number]: string } = {
    0: '*',
  };

  constructor(public europeanaService: EuropeanaService) { }
  
  onSearch(event) {
    event.stopPropagation();
    if (!(event.key === 'Enter' || event.keyCode === 13)) {
      return;
    }
    let query = event.target.value;
    if (query.trim().length === 0) {
      this.searchQuery = query = '*';
    }
    // console.error("EuropeanaSearchComponent: onSearch():", query, event.key);
    this.pageIndex = 0;
    this.totalResults = 0;
    this.gallery.clear();
    this.nextCursor = {0: '*'};
    this.search(query);
  }; /* onSearch */

  search(query: string) {
    if (query.trim().length === 0) {
      query = '*';
    }
    let params = {
      'query': query,
      'qf': 'TYPE:IMAGE',
      'media': true,
      'thumbnail': true,
      'profile': 'minimal',
      'rows': this.rows,
      'cursor': this.nextCursor[this.pageIndex],
    };
    // console.error("EuropeanaSearchComponent: search():", query, params);
    // console.error("EuropeanaSearchComponent: search():", this.pageIndex,
    //   this.nextCursor[this.pageIndex], this.nextCursor[this.pageIndex+1]);

    /*
     * Info about fields:
     *
     * https://github.com/jamesinealing/europeana-snippets/
     * https://pro.europeana.eu/page/search
     */
    this.europeanaService.search(params)
    .then((response) => {
      // console.error("EuropeanaSearchComponent: onSearch():", response);
      if (response.success && response.data.success) {
        // console.error("EuropeanaSearchComponent: onSearch():", response.data.items);
        response.data.items.forEach((image) => {
          image.src  = image.edmPreview[0];
        });
        this.images = response.data.items;
        if (response.data.nextCursor) {
          if (this.totalResults < 1) {
            this.totalResults = response.data.totalResults;
          }
          this.nextCursor[this.pageIndex+1] = response.data.nextCursor;
        } else {
          /* Pagination ended! */
          this.nextCursor[this.pageIndex+1] = this.nextCursor[this.pageIndex];
          this.totalResults = this.pageIndex * this.rows + this.images.length;
        }
      }
      // console.error("EuropeanaSearchComponent: search():", this.pageIndex,
      //   this.nextCursor[this.pageIndex], this.nextCursor[this.pageIndex+1]);
    }, (error) => {
      console.error("EuropeanaSearchComponent: onSearch():", error);
    });
  }; /* onSearch */

  handlePageEvent(e: PageEvent) {
    this.rows = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.search(this.searchQuery);
  }; /* handlePageEvent */

  onSelectionChange(e) {
    this.selectedImages = e;
    this.selected.emit(this.selectedImages);
  }; /* onSelectionChange */

}
