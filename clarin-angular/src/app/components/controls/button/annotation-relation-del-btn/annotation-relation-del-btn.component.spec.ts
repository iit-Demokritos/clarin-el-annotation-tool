import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationDelBtnComponent } from './annotation-relation-del-btn.component';

describe('AnnotationRelationDelBtnComponent', () => {
  let component: AnnotationRelationDelBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationDelBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationRelationDelBtnComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationDelBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
