import { CommonModule } from '@angular/common';
import {
  Component, ComponentRef, ElementRef, Input, NgModule, OnChanges,
  OnInit, ViewChild, ViewContainerRef, ViewEncapsulation
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { BaseControlComponent } from '../base-control/base-control.component';


@Component({
  selector: 'annotator-widget',
  templateUrl: './annotator-widget.component.html',
  styleUrls: ['./annotator-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotatorWidgetComponent extends BaseControlComponent
  implements OnInit, OnChanges {

  @ViewChild("element") element: ElementRef;
  public cmpRef: ComponentRef<any>;
  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc: ViewContainerRef;
  @Input() component: any;
  @Input() broadcastedEvent: any = {};

  layout = {
    showEditorTabs: true,
  };
  annotatorType;
  annotationSchema;
  annotatorsInnerTemplate = "";
  broadcastEvent = {};

  foundInCollection = [[]];
  foundInCollectionItems = 0;
  foundInCollectionValues = {};
  colspan = 1;

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(
      this.updateAnnotatorTemplate.bind(this)
    );
    this.updateAnnotatorTemplate();
  }

  ngOnChanges(changes) {
    // console.error("AnnotatorWidgetComponent: ngOnChanges():", changes);
    // We are interested only on broadcasted events...
    if (!changes.hasOwnProperty("broadcastedEvent")) {
      return;
    }
    this.broadcastEvent = changes.broadcastedEvent.currentValue;
    if (typeof this.cmpRef !== 'undefined') {
      this.cmpRef.instance.broadcastEvent = this.broadcastEvent;
    }
    this.changeDetectorRef.detectChanges(); // forces change detection to run
  }; /* ngOnChanges */

  updateFoundInCollection() {
    var foundInCollection = this.TextWidgetAPI.getFoundInCollection();
    // console.error("AnnotatorWidgetComponent: updateFoundInCollection():", foundInCollection);
    if (!foundInCollection.length) return;
    var annotationSchema: any = this.TextWidgetAPI.getAnnotationSchema();

    // Get the last row from foundInCollection...
    var row = this.foundInCollection[this.foundInCollection.length - 1];
    if (row.length >= this.colspan) {
      // Push a new row...
      row = [];
      this.foundInCollection.push(row);
    }
    for (var i = 0; i < foundInCollection.length; i++) {
      // Add button only if not already added...
      if (foundInCollection[i].attributes[0].value in this.foundInCollectionValues) {
        continue;
      }
      var colorCombo: any = this.coreferenceColorService.getColorCombination(undefined);
      var item = {
        annotationType: annotationSchema.annotation_type,
        annotationAttribute: annotationSchema.attribute,
        annotationValue: foundInCollection[i].attributes[0].value,
        label: ((typeof foundInCollection[i].attributes[0]['label'] != "undefined") ?
          foundInCollection[i].attributes[0].label :
          foundInCollection[i].attributes[0].value),
        customAttribute: foundInCollection[i].attributes[0]['label'],
        bgColor: colorCombo["background-colour"],
        fgColor: colorCombo["font-color"],
        colourBackground: colorCombo["background-colour"],
        colourBorder: colorCombo["border-color"],
        colourFont: colorCombo["font-color"],
        colourSelectedBackground: colorCombo["selected-background-colour"]
      }
      this.foundInCollectionValues[foundInCollection[i].attributes[0].value] = null;
      this.foundInCollectionItems++;
      row.push(item);
      if (row.length % this.colspan == 0) {
        row = [];
        this.foundInCollection.push(row);
      }
      // console.error("updateFoundInCollection():", this.foundInCollectionItems, this.colspan);
    }
    // console.error("foundInCollection:", this.foundInCollection);
    if (typeof this.cmpRef !== 'undefined') {
      this.cmpRef.instance.foundInCollection = this.foundInCollection;
    }
  }; /* updateFoundInCollection */

  updateAnnotatorTemplate() {
    return new Promise((resolve, reject) => {
      this.annotatorType    = this.TextWidgetAPI.getAnnotatorType();
      this.annotationSchema = this.TextWidgetAPI.getAnnotationSchema();
      if (this.annotatorType.length == 0) return;
      // console.error("updateAnnotatorTemplate(): calling getTemplate():", this.annotatorType, this.annotationSchema);
      this.annotatorsTemplateService.getTemplate(
        this.annotatorType, this.annotationSchema)
        .then(async (annotatorsTemplate: string) => {
          this.buttonColorService.clearColorCombinations();
          this.coreferenceColorService.clearColorCombinations();
          //console.error("annotatorsTemplate:", annotatorsTemplate);

          //if (this.annotatorType == "Button Annotator") {
          //  var foundInCollectionPosition = annotatorsTemplate.indexOf("<table") + 6;

          //  annotatorsTemplate = annotatorsTemplate.slice(0, foundInCollectionPosition)
          //    + " found-in-collection"
          //    + annotatorsTemplate.slice(foundInCollectionPosition);
          //}
          // console.error("Template:", annotatorsTemplate);

          // Try to see how many annotation types this schema involves...
          var types = annotatorsTemplate.match(/\[annotationType\]=\"[^\"]+"/ig);
          // console.error("types:", types);
          types = types.map(value => value.substr(17).replace(/['"]+/g, ''));
          // console.warn("types:", types);
          var types_unique = types.filter((value, index, self) => { return self.indexOf(value) === index; });
          // console.warn(types_unique);
          this.TextWidgetAPI.setAnnotationSchemaAnnotationTypes(types_unique);
          // Replace "\n" with <br/>...
          annotatorsTemplate = annotatorsTemplate.replaceAll("\\n", "\n");
          // Add the event listeners to all <annotation-text-text>
          annotatorsTemplate = annotatorsTemplate.replaceAll("<annotation-text-text ",
            "<annotation-text-text [broadcastedEvent]=\"broadcastEvent\" ");

          if (this.annotatorType == "Button Annotator") {
            // Get how many columns the table has...
            this.colspan = parseInt(annotatorsTemplate.match(/colspan=\"(\d+)\"/i)[1]);

            // Find the last </tbody> and place a special "row"...
            var lastTBody = annotatorsTemplate.lastIndexOf("</tbody>")
            annotatorsTemplate = annotatorsTemplate.slice(0, lastTBody)
              + '<tr *ngFor="let row of foundInCollection"><td *ngFor="let cell of row">'
              + '<annotation-button [annotationType]="cell.annotationType"'
              + '[annotationAttribute]="cell.annotationAttribute"'
              + '[annotationValue]="cell.annotationValue"'
              + '[label]="cell.label"'
              + '[customAttribute]="cell.customAttribute"'
              + '[bgColor]="cell.bgColor"'
              + '[fgColor]="cell.fgColor"'
              + '[colourBackground]="cell.colourBackground"'
              + '[colourBorder]="cell.colourBorder"'
              + '[colourFont]="cell.colourFont"'
              + '[colourSelectedBackground]="cell.colourSelectedBackground"'
              + '></annotation-button>'
              + '</td></tr>'
              + annotatorsTemplate.slice(lastTBody);
          }

          this.annotatorsInnerTemplate = (
            '<div autoslimscroll scroll-subtraction-height="145">' + annotatorsTemplate + '</div>');
          // console.error("annotatorsTemplate:", annotatorsTemplate);
          //TODO:Check dynamic compile $compile(elem.contents())(scope);
          // Does the template include Document Attributes?

          try {
            await this.initDynamicWithTemplate(this.annotatorsInnerTemplate);
          }
          catch (error) {
            console.error("compile:", error);
          }
          // console.error("compiled:", this.cmpRef)

          if (annotatorsTemplate.indexOf("group-type=\"document_attributes\"") != -1) {
            this.layout.showEditorTabs = true;
          } else {
            this.layout.showEditorTabs = false;
          }

          this.foundInCollection = [[]];
          this.foundInCollectionItems = 0;
          this.foundInCollectionValues = {};
          this.TextWidgetAPI.registerFoundInCollectionCallback(this.updateFoundInCollection.bind(this));

          this.annotationSchemaService.update(this.annotationSchema, this.annotatorType)
            .then((response: any) => {
              if (!response.success) {
                this.dialog.open(ErrorDialogComponent, {
                  data: new ConfirmDialogData("Error",
                    "Error during the save annotations. Please refresh the page and try again.")
                })
              }
            }, (error) => {
              this.dialog.open(ErrorDialogComponent, {
                data: new ConfirmDialogData("Error",
                  "Database error. Please refresh the page and try again.")
              });
              reject(false);
            });
          resolve(true);
        });
    });
  };


  async initDynamicWithTemplate(template) {
    // console.error("COMPILER:", this.compiler, template);
    this.compiler.clearCache();
    this.vc.clear();
    // console.error("DEV MODE:", isDevMode());
    // console.error("AnnotatorWidgetComponent: vc:", this.vc);

    const tmpCmp = Component({ template: template, styles: [] })(class /*extends ValueAccessorComponent<any>*/ implements OnChanges {

      broadcastEvent = {};
      foundInCollection = [];

      super() { }

      ngOnChanges(changes) {
        // console.error("Changes invoked: ", changes);
        // console.error("tmpCmp: ngOnChanges():", changes);
        // We are interested only on broadcasted events...
        if (!changes.hasOwnProperty("broadcastedEvent")) {
          return;
        }
        // The following assignment will broadcast event to all children...
        this.broadcastEvent = changes.broadcastedEvent.currentValue;
      }

      ngOnInit() {
        // console.error("Dynamic form init.");
      }

    });

    const tmpModule = NgModule({
      imports: [CommonModule, FormsModule, AppModule],
      exports: [CommonModule, FormsModule, AppModule],
      declarations: [tmpCmp],
      providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: tmpCmp, multi: true }]
    })(class {
    });

    await this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[factories.componentFactories.length - 1];
        this.cmpRef = f.create(this.injector, [], null, this._m);
        this.cmpRef.instance.name = 'DynamicControlComponent';

        this.cmpRef.instance.component = this.component;
        this.vc.insert(this.cmpRef.hostView);
        this.cmpRef.instance.broadcastEvent = this.broadcastEvent;
      }, (error) => {
        console.error("AnnotatorWidgetComponent: initDynamicWithTemplate()", template, error);
      });
  }

  public async generateDynamicViewComponent(tmpCmp: any, vc: ViewContainerRef) {
    const tmpModule = NgModule({
      declarations: [tmpCmp],
      imports: [CommonModule, FormsModule]
    })(class {
    });

    await this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        const cmpRef = f.create(this.injector, [], null, this._m);
        cmpRef.instance.name = 'DynamicControlComponent';
        vc.insert(cmpRef.hostView);
      });
  }
}
