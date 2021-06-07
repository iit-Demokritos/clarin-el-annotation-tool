import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationClearBtnComponent } from './annotation-relation-clear-btn.component';

describe('AnnotationRelationClearBtnComponent', () => {
  let component: AnnotationRelationClearBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationClearBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationRelationClearBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationClearBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
