import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefSegmentEntryComponent } from './coref-segment-entry.component';

describe('CorefSegmentEntryComponent', () => {
  let component: CorefSegmentEntryComponent;
  let fixture: ComponentFixture<CorefSegmentEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefSegmentEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefSegmentEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
