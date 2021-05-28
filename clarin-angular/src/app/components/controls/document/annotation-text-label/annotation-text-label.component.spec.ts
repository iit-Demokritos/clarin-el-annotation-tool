import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTextLabelComponent } from './annotation-text-label.component';

describe('AnnotationTextLabelComponent', () => {
  let component: AnnotationTextLabelComponent;
  let fixture: ComponentFixture<AnnotationTextLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationTextLabelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTextLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
