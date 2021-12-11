import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationSetBtnComponent } from './annotation-relation-set-btn.component';

describe('AnnotationRelationSetBtnComponent', () => {
  let component: AnnotationRelationSetBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationSetBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationRelationSetBtnComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationSetBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
