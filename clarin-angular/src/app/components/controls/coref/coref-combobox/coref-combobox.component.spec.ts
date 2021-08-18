import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefComboboxComponent } from './coref-combobox.component';

describe('CorefComboboxComponent', () => {
  let component: CorefComboboxComponent;
  let fixture: ComponentFixture<CorefComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorefComboboxComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
