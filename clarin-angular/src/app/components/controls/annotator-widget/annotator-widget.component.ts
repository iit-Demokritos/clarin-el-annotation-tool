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
import { ValueAccessorComponent } from '../value-accessor/value-accessor.component';

import { isDevMode } from '@angular/core';

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

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(
      this.updateAnnotatorTemplate.bind(this)
    );
    this.updateAnnotatorTemplate();
  }

  ngOnChanges(changes) {
    // console.error("AnnotatorWidgetComponent: Changes invoked: ", changes);
    // We are interested only on broadcasted events...
    if (!changes.hasOwnProperty("broadcastedEvent")) {
      return;
    }
    this.broadcastEvent = changes.broadcastedEvent.currentValue;
    if(typeof this.cmpRef !== 'undefined') {
      this.cmpRef.instance.broadcastEvent = this.broadcastEvent;
    }
  }; /* ngOnChanges */

  updateAnnotatorTemplate() {
    this.annotatorType = this.TextWidgetAPI.getAnnotatorType();
    this.annotationSchema = this.TextWidgetAPI.getAnnotationSchema();
    if (this.annotatorType.length == 0) return;
    // console.error("updateAnnotatorTemplate(): calling getTemplate():", this.annotatorType, this.annotationSchema);
    this.annotatorsTemplateService.getTemplate(
      this.annotatorType, this.annotationSchema)
      .then(async (annotatorsTemplate: string) => {
        this.buttonColorService.clearColorCombinations();
        this.coreferenceColorService.clearColorCombinations();
        //console.error("annotatorsTemplate:", annotatorsTemplate);

        if (this.annotatorType == "Button Annotator") {
          var foundInCollectionPosition = annotatorsTemplate.indexOf("<table") + 6;

          annotatorsTemplate = annotatorsTemplate.slice(0, foundInCollectionPosition)
            + " found-in-collection"
            + annotatorsTemplate.slice(foundInCollectionPosition);
        }
        // console.warn("Template:", annotatorsTemplate);

        // Try to see how many annotation types this schema involves...
        var types = annotatorsTemplate.match(/\[annotationType\]=\"[^\"]+"/ig);
        // console.warn("types:", types);
        types = types.map(value => value.substr(17).replace(/['"]+/g, ''));
        // console.warn("types:", types);
        var types_unique = types.filter((value, index, self) => {return self.indexOf(value) === index;});
        // console.warn(types_unique);
        this.TextWidgetAPI.setAnnotationSchemaAnnotationTypes(types_unique);
        // Replace "\n" with <br/>...
        annotatorsTemplate = annotatorsTemplate.replaceAll("\\n", "\n");
	// Add the event listeners to all <annotation-text-text>
	annotatorsTemplate = annotatorsTemplate.replaceAll("<annotation-text-text ",
	  "<annotation-text-text [broadcastedEvent]=\"broadcastEvent\" ");
	// console.error("annotatorsTemplate:", annotatorsTemplate);

        this.annotatorsInnerTemplate = (
          '<div autoslimscroll scroll-subtraction-height="145">' + annotatorsTemplate + '</div>');
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
            })
          });
      });
  };


  async initDynamicWithTemplate(template) {
    this.compiler.clearCache();
    this.vc.clear();
    console.error("DEV MODE:", isDevMode());

    const tmpCmp = Component({ template: template, styles:[] })(class /*extends ValueAccessorComponent<any>*/ implements OnChanges {

      broadcastEvent = {};
      
      super() { }

      ngOnChanges(changes) {
        // console.error("Changes invoked: ", changes);
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
