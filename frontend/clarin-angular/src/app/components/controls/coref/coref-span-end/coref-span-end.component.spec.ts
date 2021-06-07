import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefSpanEndComponent } from './coref-span-end.component';

describe('CorefSpanEndComponent', () => {
  let component: CorefSpanEndComponent;
  let fixture: ComponentFixture<CorefSpanEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefSpanEndComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefSpanEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
