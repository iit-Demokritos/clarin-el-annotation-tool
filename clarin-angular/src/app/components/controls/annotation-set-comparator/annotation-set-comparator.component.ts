import { Component, OnInit, AfterViewInit, Input, ViewEncapsulation, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { AnnotationSetInspectorComponent } from 'src/app/components/controls/annotation-set-inspector/annotation-set-inspector.component';
import { AnnotationSetFilterComponent } from 'src/app/components/controls/annotation-set-filter/annotation-set-filter.component';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';
import { sortAnnotationSet, diffAnnotationSets, diffedAnnotationSetsToCategoriesMatrix, diffedAnnotationSetsCategories, cohenKappa, fleissKappa } from 'src/app/helpers/annotation';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-annotation-set-comparator',
  templateUrl: './annotation-set-comparator.component.html',
  styleUrls: ['./annotation-set-comparator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationSetComparatorComponent extends MainComponent implements OnInit, AfterViewInit {

  @Input() allowMultipleAnnotators: boolean       = false;
  @Input() showAnnotatorSelectionToolbar: boolean = false;
  @Input() showAnnotationSetFilter: boolean       = true;
  @Input() numberOfComparators: number            = 2;
  @Input() clearOnDocumentsChange: boolean        = true;

  @Input() collections: Collection|Collection[]   = [];
  private  _documents: Document|Document[]        = []; 
  @Input() set documents(value: Document|Document[]) {
    this._documents = value;
    if (this.clearOnDocumentsChange) {this.onClear();}
  };
  get documents(): Document|Document[] {
    return this._documents;
  };
  @Input() annotations: any[]                     = [];
  @Input() annotators: object[]                   = [];

  showTabIAA: boolean                             = false;
  showTabDiff: boolean                            = false;
  numberOfComparatorsArray: number[];
  comparatorAreaSize: number;

  @ViewChildren(AnnotationSetInspectorComponent)
  private annotationSetInspectorComponent!: QueryList<AnnotationSetInspectorComponent>;

  @ViewChildren(AnnotationSetFilterComponent)
  private AnnotationSetFilterComponent!: QueryList<AnnotationSetFilterComponent>;

  @ViewChild(MatTable)
  table: MatTable<any>;
  categoriesMatrixDataSource = new MatTableDataSource<number[]>();

  selectedAnnotator: any[]        = [];
  text: string[]                  = [];
  visualisation_options: object[] = [];

  kappaCohen  = 0.0;
  kappaFleiss = 0.0;
  categoriesMatrix: number[][] = [];
  categories: string[] = [];
  columnsToDisplay = [];

  super() { }

  ngOnInit(): void {
    this.numberOfComparatorsArray = Array(this.numberOfComparators).fill(0).map((x,i)=>i); // [0,1,2,3,4];
    this.comparatorAreaSize    = 100/this.numberOfComparators;
    this.selectedAnnotator     = Array(this.numberOfComparators).fill({});
    this.annotations           = Array(this.numberOfComparators).fill([]);
    this.text                  = Array(this.numberOfComparators).fill("");
    this.visualisation_options = Array(this.numberOfComparators).fill({});
  }; /* ngOnInit */

  addComparator() {
    this.numberOfComparatorsArray.push(this.numberOfComparators);
    this.numberOfComparators += 1;
    this.comparatorAreaSize    = 100/this.numberOfComparators;
    this.selectedAnnotator.push({});
    this.annotations.push([]);
    this.text.push("");
    this.visualisation_options.push({});
  }; /* addComparator */

  removeComparator() {
    this.numberOfComparators -= 1;
    this.comparatorAreaSize = 100/this.numberOfComparators;
    this.numberOfComparatorsArray.pop();
    this.selectedAnnotator.pop();
    this.annotations.pop();
    this.text.pop();
    this.visualisation_options.pop();
    this.columnsToDisplay      = Array(this.numberOfComparators).fill('value');
  }; /* removeComparator */

  ngAfterViewInit(): void {
    this.onClear();
    // setTimeout(() => {
    //   this.applyFilterAll();
    // }, 1000);
  }; /* ngAfterViewInit */

  onClear(): void {
    this.showTabIAA  = false;
    this.showTabDiff = false;
    if (this.annotationSetInspectorComponent) {
      this.annotationSetInspectorComponent.forEach((child) => child.onClear());
    }
  }; /* onClear */

  onAnnotatorsChange(child, event) {
    this.selectedAnnotator[child] = event;
  }; /* onAnnotatorsChange */

  filterAnnotations(annotations) {
    return annotations.filter((ann) => 
      !(this.TextWidgetAPI.isSettingAnnotation(ann) ||
        this.TextWidgetAPI.isAttributeAnnotation(ann))
    );
  }; /* filterAnnotations */
  
  onApply(child, event) {
    this.showTabIAA  = false;
    this.showTabDiff = false;
    this.annotationService.get(this.collections[0]['id'],
                               this.documents[0]['id'],
                               this.selectedAnnotator[child]['name'])
    .then((response) => {
      if (response["success"]) {
        this.annotations[child] = this.filterAnnotations(response["data"])
        this.annotations[child] = sortAnnotationSet(this.annotations[child]);
        this.compareAnnotations();
        this.changeDetectorRef.detectChanges(); // forces change detection to run
        this.annotationSetInspectorComponent.get(child).onApply(event);
      } else {
        this.annotators= [];
      }
    },
    (error) => {
      this.annotators = [];
    });
  }; /* onApply */

  onApplyFilter(child, event) {
    this.showTabIAA  = false;
    this.showTabDiff = false;
    // console.error("CompareAnnotationsComponent: onApplyFilter()", child, event);
    if (!event) {return;}
    this.analyticsService.find(event)
    .then((response) => {
      if (response["success"]) {
        this.annotations[child] = this.filterAnnotations(response["data"]);
        let ann = this.annotations[child].find(obj => 'annotator_id' in obj);
        if (ann) {
          this.selectedAnnotator[child] = {
            _id: ann['annotator_id']
          }
        }
        
        this.annotations[child] = this.filterAnnotations(response["data"]);
        this.annotations[child] = sortAnnotationSet(this.annotations[child])
          .map((obj) => {obj['diff_class'] = "diff-equal"; return obj;});
        this.compareAnnotations();
        this.changeDetectorRef.detectChanges(); // forces change detection to run
        this.annotationSetInspectorComponent.get(child).onApply(event);
      } else {
      }
    }, (error) => {
    });
  }; /* onApplyFilter */

  applyFilterAll() {
    this.AnnotationSetFilterComponent.forEach((child, index) => this.onApplyFilter(index, child.mongoQuery));
  }; /* applyFilterAll */

  compareAnnotations() {
    if (!this.annotations.every((child) => child.length > 0)) {return;}
    // All children have annotations, proceed with the comparisons...
    // console.error("AnnotationSetComparatorComponent: compareAnnotations(): all comparators filled!");
    this.annotations = diffAnnotationSets(this.annotations);
    this.changeDetectorRef.detectChanges(); // forces change detection to run
    this.annotationSetInspectorComponent.forEach((child) => child.onApply());
    // Calculate the categories matrix...
    this.categories       = diffedAnnotationSetsCategories(this.annotations, "type");
    this.categoriesMatrix = diffedAnnotationSetsToCategoriesMatrix(this.annotations, "type", this.categories);
    this.columnsToDisplay = ["id", ...this.categories];
    this.categoriesMatrixDataSource.data = this.categoriesMatrix;
    this.table.renderRows();
    this.toastrService.info("Inter-Annotator Agreement Calculated!");
    this.showTabIAA  = true;
    this.showTabDiff = false;
    // Fleiss' Kappa...
    this.kappaFleiss = fleissKappa(this.categoriesMatrix, this.annotations.length);
    console.error("Fleiss Kappa:", this.kappaFleiss);
    this.kappaCohen = cohenKappa(this.annotations[0].filter((ann) => 'type' in ann), this.annotations[1].filter((ann) => 'type' in ann));
    console.error("Cohen Kappa:", this.kappaCohen);
  }; /* compareAnnotations */

}
