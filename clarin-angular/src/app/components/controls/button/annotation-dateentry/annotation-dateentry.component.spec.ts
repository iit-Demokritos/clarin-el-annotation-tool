import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationDateentryComponent } from './annotation-dateentry.component';

describe('AnnotationDateentryComponent', () => {
  let component: AnnotationDateentryComponent;
  let fixture: ComponentFixture<AnnotationDateentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationDateentryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationDateentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
