import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationImportBtnComponent } from './annotation-relation-import-btn.component';

describe('AnnotationRelationImportBtnComponent', () => {
  let component: AnnotationRelationImportBtnComponent;
  let fixture: ComponentFixture<AnnotationRelationImportBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationRelationImportBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationImportBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
