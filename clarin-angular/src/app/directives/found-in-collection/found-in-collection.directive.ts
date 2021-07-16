import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from 'src/app/services/coreference-color-data-service/coreference-color-data.service';
import { CoreferenceColorService } from 'src/app/services/coreference-color-service/coreference-color.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';

@Directive({
  selector: '[appFoundInCollection]'
})
export class FoundInCollectionDirective implements OnInit {

  splittedColSpan;

  constructor(    private view: ViewContainerRef,
    private template: TemplateRef<any>,private TextWidgetAPI:TextWidgetAPI,
    private coreferenceColorService:CoreferenceColorService) { }
  
    ngOnInit() {
      this.TextWidgetAPI.registerFoundInCollectionCallback(this.updateFoundInCollection);
    }

    updateFoundInCollection() {	
      var annotationSchema:any = this.TextWidgetAPI.getAnnotationSchema();
      var foundInCollection = this.TextWidgetAPI.getFoundInCollection();
      var template = "";
      var colsNumber = 1;

      var colSpans = this.template.elementRef.nativeElement.outerHTML.match(/colspan="[0-9]*"/g);
          if (colSpans.length>0) {
            this.splittedColSpan = colSpans[colSpans.length-1].split("\"");
            var colsNumber = parseInt(this.splittedColSpan[1]);
          } 

          for (var i=0; i<foundInCollection.length; i++) {
            var colorCombo:any = this.coreferenceColorService.getColorCombination(null);

        if (i%colsNumber==0)
          template += "<tr>";

        template += "<td><annotation-button id=\"x_button123\" annotation-type=\"" + annotationSchema.annotation_type + 
                                   "\" annotation-attribute=\"" + annotationSchema.attribute + 
                                   "\" annotation-value=\"" + foundInCollection[i].attributes[0].value + 
                                   "\" label=\"" + foundInCollection[i].attributes[0].value + 
                                   "\" bg-color=\"" + colorCombo.bg_color + 
                                   "\" fg-color=\"" + colorCombo.fg_color + "\"></annotation-button></td>";								
      
        if (i==foundInCollection.length-1 || (i!=0 && (i+1)%colsNumber==0))
          template += "</tr>";
          }

      //TODO: Check dynamic compilation of component var compiledTemplate = $compile(template)(scope);
      this.template.elementRef.nativeElement.append(template);
    };

    

}
