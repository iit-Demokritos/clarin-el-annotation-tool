import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotatorWidgetValuesSchwartzComponent } from './annotator-widget-values-schwartz.component';

describe('AnnotatorWidgetValuesSchwartzComponent', () => {
  let component: AnnotatorWidgetValuesSchwartzComponent;
  let fixture: ComponentFixture<AnnotatorWidgetValuesSchwartzComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnotatorWidgetValuesSchwartzComponent]
    });
    fixture = TestBed.createComponent(AnnotatorWidgetValuesSchwartzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
