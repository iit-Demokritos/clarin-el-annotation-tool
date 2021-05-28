import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationComboboxComponent } from './annotation-combobox.component';

describe('AnnotationComboboxComponent', () => {
  let component: AnnotationComboboxComponent;
  let fixture: ComponentFixture<AnnotationComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationComboboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
