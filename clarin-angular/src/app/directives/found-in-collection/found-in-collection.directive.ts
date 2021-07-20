import { Compiler, Directive, Component, OnInit, TemplateRef, ElementRef, ViewContainerRef, NgModule, Injector, NgModuleRef } from '@angular/core';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from 'src/app/services/coreference-color-data-service/coreference-color-data.service';
import { CoreferenceColorService } from 'src/app/services/coreference-color-service/coreference-color.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[found-in-collection]'
})
export class FoundInCollectionDirective implements OnInit {

  foundInCollectionItems = 0;
  foundInCollectionValues = {};

  constructor(
    private TextWidgetAPI: TextWidgetAPI,
    private coreferenceColorService: CoreferenceColorService,
    private compiler: Compiler,
    private injector: Injector,
    private _m: NgModuleRef<any>,
    private vc: ViewContainerRef,
    private element: ElementRef
  ) {};

  /*
  constructor(    private view: ViewContainerRef,
    private template: TemplateRef<any>,private TextWidgetAPI:TextWidgetAPI,
    private coreferenceColorService:CoreferenceColorService) { }
  */

  ngOnInit() {
    this.TextWidgetAPI.registerFoundInCollectionCallback(this.updateFoundInCollection.bind(this));
  }

  updateFoundInCollection() {
    var annotationSchema:any = this.TextWidgetAPI.getAnnotationSchema();
    var foundInCollection = this.TextWidgetAPI.getFoundInCollection();
    // console.error("FoundInCollectionDirective: updateFoundInCollection():", foundInCollection);
    if (!foundInCollection.length) return;
    var template = "";
    // console.error(this.vc, this.element);
    var colsNumber = this.element.nativeElement.rows[0].cells[0].colSpan;
    for (var i=0; i<foundInCollection.length; i++) {
      // Add button only if not already added...
      if (foundInCollection[i].attributes[0].value in this.foundInCollectionValues) {
        continue;
      }
      var colorCombo:any = this.coreferenceColorService.getColorCombination(undefined);
      if (this.foundInCollectionItems % colsNumber == 0) {
        template += "<tr>";
      }
      console.error("foundInCollectionItems:", this.foundInCollectionItems, "colsNumber:", colsNumber);

      template += "<td><annotation-button id=\"x_button_fic_"+this.foundInCollectionItems.toString()+
        "\" [annotationType]=\"'" + annotationSchema.annotation_type +
        "'\" [annotationAttribute]=\"'" + annotationSchema.attribute +
        "'\" [annotationValue]=\"'" + foundInCollection[i].attributes[0].value +
        "'\" [label]=\"'" + ((typeof foundInCollection[i].attributes[0]['label'] != "undefined") ?
              foundInCollection[i].attributes[0].label :
              foundInCollection[i].attributes[0].value) +
        "'\" [customAttribute]=\"'" + foundInCollection[i].attributes[0]['label'] +
        "'\" [bgColor]=\"'" + colorCombo["background-colour"] +
        "'\" [fgColor]=\"'" + colorCombo["font-color"] +
        "'\" [colourBackground]=\"'" + colorCombo["background-colour"] +
        "'\" [colourBorder]=\"'" + colorCombo["border-color"] +
        "'\" [colourFont]=\"'" + colorCombo["font-color"] +
        "'\" [colourSelectedBackground]=\"'" + colorCombo["selected-background-colour"] +
        "'\"></annotation-button></td>";
      this.foundInCollectionValues[foundInCollection[i].attributes[0].value] = null;
      this.foundInCollectionItems++;

      // change condition to put buttons horizontally
      if (this.foundInCollectionItems == foundInCollection.length - 1 ||
          (this.foundInCollectionItems != 0 && (this.foundInCollectionItems + 1) % colsNumber == 0)) {
        template += "</tr>";
      }
    }
    console.error("FoundInCollectionDirective: updateFoundInCollection(): template:", template);
    try {
      this.initDynamicWithTemplate(template);
      // console.error("COMPILED!");
    }
    catch (error) {
      console.error("FoundInCollectionDirective: compile:", error);
    }
  };

  initDynamicWithTemplate(template) {
    this.compiler.clearCache();

    const tmpCmp = Component({ template: template, styles:[] })(class {
    });

    const tmpModule = NgModule({
      imports: [CommonModule, FormsModule, AppModule],
      exports: [CommonModule, FormsModule, AppModule],
      declarations: [tmpCmp],
      providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: tmpCmp, multi: true }]
    })(class {
    });

    var factories = this.compiler.compileModuleAndAllComponentsSync(tmpModule);
    const f = factories.componentFactories[factories.componentFactories.length - 1];
    var cmpRef = f.create(this.injector, [], null, this._m);
    cmpRef.instance.name = 'DynamicControlComponent';
    // console.error("cmpRef:", cmpRef, this);
    // console.error("FoundInCollectionDirective: vc:", this.vc);
    this.vc.insert(cmpRef.hostView);

    /*
    if (template.startsWith("<tr")) {
      this.element.nativeElement.append(cmpRef.location.nativeElement);
    } else {
      var newCell = this.element.nativeElement.rows[this.element.nativeElement.rows.length - 1];
      newCell.append(cmpRef.location.nativeElement);
    }*/
  }
}
