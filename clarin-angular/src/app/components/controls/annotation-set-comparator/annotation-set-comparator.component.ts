import { Component, OnInit, AfterViewInit, Input, ViewEncapsulation, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { AnnotationSetInspectorComponent } from 'src/app/components/controls/annotation-set-inspector/annotation-set-inspector.component';
import { AnnotationSetFilterComponent } from 'src/app/components/controls/annotation-set-filter/annotation-set-filter.component';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';
import { sortAnnotationSet, diffAnnotationSets, diffAnnotationSetsOptions, diffedAnnotationSetsToRatersMatrix, diffedAnnotationSetsToCategoriesMatrix, diffedAnnotationSetsRaters, diffedAnnotationSetsCategories, cohenKappa, fleissKappa } from 'src/app/helpers/annotation';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import Krippendorff from '@externals/krippendorff-alpha/src/krippendorff';
import { ScrollStatus } from 'src/app/models/services/scrollstatus';

// import { ComponentPortal, DomPortal } from '@angular/cdk/portal';

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
  @Input() showComparisonOptions: boolean         = true;
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
  annotationsShown: any[]                         = [];

  showTabIAA: boolean                             = false;
  showTabDiff: boolean                            = false;
  numberOfComparatorsArray: number[];
  comparatorAreaSize: number;

  @ViewChildren(AnnotationSetInspectorComponent)
  private annotationSetInspectorComponent!: QueryList<AnnotationSetInspectorComponent>;

  @ViewChildren(AnnotationSetFilterComponent)
  private AnnotationSetFilterComponent!: QueryList<AnnotationSetFilterComponent>;

  @ViewChild('rating_table')       table_rating:       MatTable<any>;
  @ViewChild('agreement_table')    table_agreement:    MatTable<any>;
  @ViewChild('fleiss_table')       table_fleiss:       MatTable<any>;
  @ViewChild('krippendorff_table') table_krippendorff: MatTable<any>;

  ratersMatrixDataSource     = new MatTableDataSource<number[]>();
  categoriesMatrixDataSource = new MatTableDataSource<number[]>();
  agreementMatrixDataSource  = new MatTableDataSource<number[]>();

  selectedAnnotator: any[]        = [];
  text: string[]                  = [];
  visualisation_options: object[] = [];

  kappaCohen: number           = 0.0;
  kappaFleiss: number          = 0.0;
  alphaKrippendorff: number    = 0.0;
  categoriesMatrix: number[][] = [];
  categories: string[]         = [];
  columnsToDisplay: string[]   = [];
  ratersMatrix: number[][]     = [];
  raters: string[]             = [];
  ratersColumnsToDisplay: string[] = [];

  optionsSpanOverlapPercentage: number = 100;
  // This is reduced version of categories matrix, with rows that sum to 1 are removed.
  // It is used in the calculation of Krippendorff’s Alpha:
  // https://www.real-statistics.com/reliability/interrater-reliability/krippendorffs-alpha/krippendorffs-alpha-basic-concepts/
  agreementMatrix: number[][]  = [];

  /* Variables used by the overlays... */
  // overlayRef;
  // annotationSetFilterPortal;
  public default_model = {query: {condition: 'and', rules: []}, valid: false};
  annotationSetFilterModel: any[];
  isOpenAnnotationsFilter: boolean[] = [];
  isOpenComparisonOptions: boolean[] = [];

  super() { }

  ngOnInit(): void {
    this.numberOfComparatorsArray = Array(this.numberOfComparators).fill(0).map((x,i)=>i); // [0,1,2,3,4];
    this.comparatorAreaSize       = 100/this.numberOfComparators;
    this.selectedAnnotator        = Array(this.numberOfComparators).fill({});
    this.annotations              = Array(this.numberOfComparators).fill([]);
    this.annotationsShown         = Array(this.numberOfComparators).fill([]);
    this.text                     = Array(this.numberOfComparators).fill("");
    this.visualisation_options    = Array(this.numberOfComparators).fill({});
    this.isOpenAnnotationsFilter  = Array(this.numberOfComparators).fill(false);
    this.isOpenComparisonOptions  = Array(this.numberOfComparators).fill(false);
    this.annotationSetFilterModel = Array(this.numberOfComparators).fill({}).map((x) => {return {... this.default_model}});
  }; /* ngOnInit */

  addComparator() {
    this.numberOfComparatorsArray.push(this.numberOfComparators);
    this.numberOfComparators += 1;
    this.comparatorAreaSize    = 100/this.numberOfComparators;
    this.selectedAnnotator.push({});
    this.annotations.push([]);
    this.annotationsShown.push([]);
    this.text.push("");
    this.visualisation_options.push({});
    this.isOpenAnnotationsFilter.push(false);
    this.isOpenComparisonOptions.push(false);
    this.annotationSetFilterModel.push({... this.default_model});
    this.clearComparisons();
  }; /* addComparator */

  removeComparator() {
    this.numberOfComparators -= 1;
    this.comparatorAreaSize = 100/this.numberOfComparators;
    this.numberOfComparatorsArray.pop();
    this.selectedAnnotator.pop();
    this.annotations.pop();
    this.annotationsShown.pop();
    this.text.pop();
    this.visualisation_options.pop();
    this.annotationSetFilterModel.pop();
    this.clearComparisons();
  }; /* removeComparator */

  ngAfterViewInit(): void {
    this.onClear();
    // setTimeout(() => {
    //   this.applyFilterAll();
    // }, 1000);
    //
    // this.overlayRef = this.overlay.create();
    // this.annotationSetFilterPortal = Array(this.numberOfComparators).fill({});
    // this.numberOfComparatorsArray.forEach((x, child) => {
    //   this.annotationSetFilterPortal[child] = new DomPortal(this.AnnotationSetFilterComponent[child]);
    // });

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
        this.annotationsShown[child] = this.annotations[child];
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

  // onShowFilter(child, event) {
  //   this.isOpenAnnotationsFilter[child] = !this.isOpenAnnotationsFilter[child];
  //   console.error("AnnotationSetFilterComponent:", this.annotationSetFilterPortal[child], this.AnnotationSetFilterComponent[child]);
  //   if (this.isOpenAnnotationsFilter[child]) {
  //     this.overlayRef.attach(this.annotationSetFilterPortal[child]);
  //   } else {
  //     this.overlayRef.detach(this.annotationSetFilterPortal[child]);
  //   }
  // }; /* onShowFilter */

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
          .map((obj) => {obj['diff_class'] = "diff-unknown"; return obj;});

        // this.annotations[child] = this.annotations[child].slice(0, 10);

        this.annotationsShown[child] = this.annotations[child];
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

  applyFilterForChild(child) {
    this.onApplyFilter(child, this.AnnotationSetFilterComponent.get(child).mongoQuery);
  }; /* applyFilterForChild */

  compareAnnotations() {
    if (!this.annotations.every((child) => child.length > 0)) {return;}
    // All children have annotations, proceed with the comparisons...
    // console.error("AnnotationSetComparatorComponent: compareAnnotations(): all comparators filled!");
    var diffOptions: diffAnnotationSetsOptions = {
      spanOverlapPercentage: this.optionsSpanOverlapPercentage,
      attributeName:         "type",
      attributeValues:       []
    };
    this.annotationsShown = diffAnnotationSets(this.annotations, diffOptions);
    this.changeDetectorRef.detectChanges(); // forces change detection to run
    this.annotationSetInspectorComponent.forEach((child) => child.onApply());
    // Calculate the raters matrix...
    this.raters                         = diffedAnnotationSetsRaters(this.annotationsShown);
    this.ratersMatrix                   = diffedAnnotationSetsToRatersMatrix(this.annotationsShown, "type", this.categories);;
    this.ratersColumnsToDisplay         = ["id", ...this.raters];
    this.ratersMatrixDataSource.data    = this.ratersMatrix;
    // Calculate the categories matrix...
    this.categories       = diffedAnnotationSetsCategories(this.annotationsShown, "type");
    this.categoriesMatrix = diffedAnnotationSetsToCategoriesMatrix(this.annotationsShown, "type", this.categories);
    this.columnsToDisplay = ["id", ...this.categories];
    this.categoriesMatrixDataSource.data = this.categoriesMatrix;
    // Caluclate the agreement matrix...
    this.agreementMatrix                = this.categoriesMatrix.filter((row) => row.reduce((accumulator, curr) => accumulator + curr) > 1);
    this.agreementMatrixDataSource.data = this.agreementMatrix;
    this.table_rating.renderRows();
    this.table_agreement.renderRows();
    this.table_fleiss.renderRows();
    this.table_krippendorff.renderRows();
    this.toastrService.info("Inter-Annotator Agreement Calculated!");
    this.showTabIAA  = true;
    this.showTabDiff = true;
    // Fleiss’s Kappa...
    try {
      this.kappaFleiss = fleissKappa(this.categoriesMatrix, this.annotationsShown.length);
      console.error("Fleiss Kappa:", this.kappaFleiss);
    } catch (error) {
      console.error("Fleiss Kappa:", error);
    }
    // Krippendorff’s Alpha...
    try {
      let kripCal = new Krippendorff();
      // Try to predict if calculation will fail:
      let filteredMatrix = kripCal._removeEmptyItem(this.ratersMatrix);
      if (filteredMatrix.length) {
        kripCal.setArrayData(filteredMatrix, 'categorical');
        kripCal.calculate();
        this.alphaKrippendorff = kripCal._KrAlpha;
      } else {
	this.alphaKrippendorff = 0;
      }
      console.error("Krippendorff Alpha:", this.alphaKrippendorff);
    } catch (error) {
      console.error("Krippendorff Alpha:", error);
    }
    // Cohen’s Kappa...
    try {
      this.kappaCohen = cohenKappa(this.annotationsShown[0].filter((ann) => 'type' in ann), this.annotationsShown[1].filter((ann) => 'type' in ann));
      console.error("Cohen Kappa:", this.kappaCohen);
    } catch (error) {
      console.error("Cohen Kappa:", error);
    }
  }; /* compareAnnotations */

  clearComparisons() {
    this.categories             = [];
    this.categoriesMatrix       = [];
    this.columnsToDisplay       = [];
    this.raters                 = [];
    this.ratersMatrix           = [];
    this.ratersColumnsToDisplay = [];
    this.agreementMatrix        = [];

    this.ratersMatrixDataSource.data     = this.ratersMatrix;
    this.categoriesMatrixDataSource.data = this.categoriesMatrix;
    this.agreementMatrixDataSource.data  = this.agreementMatrix;
    this.table_rating.renderRows();
    this.table_agreement.renderRows();
    this.table_fleiss.renderRows();
    this.table_krippendorff.renderRows();
    this.showTabIAA  = false;
    this.showTabDiff = false;
    this.kappaCohen  = 0.0;
    this.kappaFleiss = 0.0;
    this.alphaKrippendorff = 0.0;
    for (let i = 0; i < this.annotations.length; i++) {
      this.annotations[i] = this.annotations[i].filter((ann) => "type" in ann);
    }
    this.changeDetectorRef.detectChanges(); // forces change detection to run
    this.annotationSetInspectorComponent.forEach((child) => child.onApply());
  }; /* clearComparisons */

  onScroll(child, event: ScrollStatus) {
    // console.error("AnnotationSetComparatorComponent: onScroll():", child, event);
    this.annotationSetInspectorComponent.forEach((ch, index) => {if (index != child) {ch.setScrollStatus(event)}});
  }; /* onScroll */

}
