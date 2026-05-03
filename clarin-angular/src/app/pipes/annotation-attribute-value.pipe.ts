import { Pipe, PipeTransform } from '@angular/core';
import { Annotation } from 'src/app/models/annotation';
import { COMMON_ATTRIBUTE_NAMES } from 'src/app/models/attribute';

@Pipe({
  name: 'annotationAttributeValue'
})
export class AnnotationAttributeValuePipe implements PipeTransform {

  transform(ann: Annotation, types: string[] = COMMON_ATTRIBUTE_NAMES, ...args: unknown[]): string {
    if (!ann.attributes) {
      return "";
    }
    const attrs = ann.attributes.filter(attr => types.includes(attr["name"]));
    if (attrs?.length) {
      return attrs[0].value;
    }
    return ann.attributes[0].value ?? "";
  }
}
