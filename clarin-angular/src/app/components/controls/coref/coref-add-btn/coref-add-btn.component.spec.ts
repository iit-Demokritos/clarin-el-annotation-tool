import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefAddBtnComponent } from './coref-add-btn.component';

describe('CorefAddBtnComponent', () => {
  let component: CorefAddBtnComponent;
  let fixture: ComponentFixture<CorefAddBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefAddBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefAddBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
