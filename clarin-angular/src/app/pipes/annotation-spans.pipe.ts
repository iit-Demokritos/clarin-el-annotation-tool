import { Pipe, PipeTransform } from '@angular/core';
import { Annotation } from 'src/app/models/annotation';

@Pipe({
  name: 'annotationSpans'
})
export class AnnotationSpansPipe implements PipeTransform {

  transform(ann: Annotation, anns: Annotation[] = undefined, ...args: unknown[]): string {
    if (!ann.spans) {return "";}
    // If we have spans, transform the spans...
    if (ann.spans.length) {
      return ann.spans.map((s) => 
        '['+s.start.toString()+':'+s.end.toString()+']').join(', ');
    }
    // No spans. Do we have an array of spans as argument?
    if (!anns) {return "";}
    // The annotation does not have any spans. Check if we can
    // find some related annotations...
    let relation_args = ann.attributes.filter(attr => attr["name"] == "arg1" || attr["name"] == "arg2");
    if (!relation_args.length) {return "";}
    let spans = relation_args.reduce((accumulator, attr) => {
      let _ann = anns.find(a => a._id == attr.value);
      if (_ann) {return accumulator.concat(_ann.spans);}
      return accumulator;
    }, []);
    return spans.map((s) => 
        '['+s.start.toString()+':'+s.end.toString()+']').join(', ');
  }

}
