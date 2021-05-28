import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefDelBtnComponent } from './coref-del-btn.component';

describe('CorefDelBtnComponent', () => {
  let component: CorefDelBtnComponent;
  let fixture: ComponentFixture<CorefDelBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefDelBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefDelBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
