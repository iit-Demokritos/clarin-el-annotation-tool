import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotatorWidgetComponent } from './annotator-widget.component';

describe('AnnotatorWidgetComponent', () => {
  let component: AnnotatorWidgetComponent;
  let fixture: ComponentFixture<AnnotatorWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotatorWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotatorWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
