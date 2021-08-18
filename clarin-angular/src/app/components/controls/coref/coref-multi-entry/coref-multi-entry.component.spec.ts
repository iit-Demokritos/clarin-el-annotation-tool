import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefMultiEntryComponent } from './coref-multi-entry.component';

describe('CorefMultiEntryComponent', () => {
  let component: CorefMultiEntryComponent;
  let fixture: ComponentFixture<CorefMultiEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorefMultiEntryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefMultiEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
