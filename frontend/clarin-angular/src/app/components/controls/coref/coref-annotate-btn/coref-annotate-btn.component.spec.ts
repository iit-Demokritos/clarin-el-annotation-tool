import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefAnnotateBtnComponent } from './coref-annotate-btn.component';

describe('CorefAnnotateBtnComponent', () => {
  let component: CorefAnnotateBtnComponent;
  let fixture: ComponentFixture<CorefAnnotateBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefAnnotateBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefAnnotateBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
