import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefCheckboxComponent } from './coref-checkbox.component';

describe('CorefCheckboxComponent', () => {
  let component: CorefCheckboxComponent;
  let fixture: ComponentFixture<CorefCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorefCheckboxComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
