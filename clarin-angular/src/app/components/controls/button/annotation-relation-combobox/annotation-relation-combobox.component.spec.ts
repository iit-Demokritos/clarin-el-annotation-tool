import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationComboboxComponent } from './annotation-relation-combobox.component';

describe('AnnotationRelationComboboxComponent', () => {
  let component: AnnotationRelationComboboxComponent;
  let fixture: ComponentFixture<AnnotationRelationComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationRelationComboboxComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
