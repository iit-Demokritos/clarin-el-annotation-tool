import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefBtnComponent } from './coref-btn.component';

describe('CorefBtnComponent', () => {
  let component: CorefBtnComponent;
  let fixture: ComponentFixture<CorefBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
