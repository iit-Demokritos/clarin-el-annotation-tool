import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationAnnotateBtnComponent } from './annotation-relation-annotate-btn.component';

describe('AnnotationRelationAnnotateBtnComponent', () => {
  let component: AnnotationRelationAnnotateBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationAnnotateBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationRelationAnnotateBtnComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationAnnotateBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
