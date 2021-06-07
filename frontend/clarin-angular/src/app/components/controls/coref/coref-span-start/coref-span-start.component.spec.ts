import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefSpanStartComponent } from './coref-span-start.component';

describe('CorefSpanStartComponent', () => {
  let component: CorefSpanStartComponent;
  let fixture: ComponentFixture<CorefSpanStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefSpanStartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefSpanStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
