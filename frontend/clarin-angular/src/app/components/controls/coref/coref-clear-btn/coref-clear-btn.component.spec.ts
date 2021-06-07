import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefClearBtnComponent } from './coref-clear-btn.component';

describe('CorefClearBtnComponent', () => {
  let component: CorefClearBtnComponent;
  let fixture: ComponentFixture<CorefClearBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefClearBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefClearBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
