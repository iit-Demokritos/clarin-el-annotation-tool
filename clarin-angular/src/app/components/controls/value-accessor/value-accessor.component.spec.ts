import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAccessorComponent } from './value-accessor.component';

describe('ValueAccessorComponent', () => {
  let component: ValueAccessorComponent;
  let fixture: ComponentFixture<ValueAccessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueAccessorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueAccessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
