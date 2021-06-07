import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationAnotateBtnComponent } from './annotation-relation-anotate-btn.component';

describe('AnnotationRelationAnotateBtnComponent', () => {
  let component: AnnotationRelationAnotateBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationAnotateBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationRelationAnotateBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationAnotateBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
