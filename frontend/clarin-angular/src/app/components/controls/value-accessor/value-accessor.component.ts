import { Component, Input, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { MainComponent } from '../../views/main/main.component';

@Component({
  selector: 'app-value-accessor',
  templateUrl: './value-accessor.component.html',
  styleUrls: ['./value-accessor.component.scss']
})
export abstract class ValueAccessorComponent<T> extends MainComponent implements ControlValueAccessor, OnInit {

  @Input() parent: any;
  @Input() predefinedValueEvent: any;

  super() {
  }

  private innerValue: T;
  private initialValueSet: boolean = false;

  private changed = new Array<(value: T) => void>();
  private touched = new Array<() => void>();

  ngOnInit(){
  }


  get value(): T {
    try {

      return this.innerValue;
    } catch (e) { console.log(e); }
  }


  set value(value: T) {
    try {
      if (this.innerValue !== value) {
        this.innerValue = value;

        this.valueModified();
        this.changed.forEach(f => f(value));
      }

    } catch (e) { console.log(e); }
  }


  touch() {
    try {
      this.touched.forEach(f => f());
    } catch (e) { console.log(e); }
  }


  writeValue(value: T) {
    try {
      this.innerValue = value;

      if (typeof value != "undefined" && value != null) {
        this.valueChanged();
      }
    } catch (e) { console.log(e); }
  }


  registerOnChange(fn: (value: T) => void) {
    try {
      this.changed.push(fn);
    } catch (e) { console.log(e); }
  }


  registerOnTouched(fn: () => void) {
    try {
      this.touched.push(fn);
    } catch (e) { console.log(e); }
  }

  protected valueModified() { }

  protected valueChanged(): void { }
}

