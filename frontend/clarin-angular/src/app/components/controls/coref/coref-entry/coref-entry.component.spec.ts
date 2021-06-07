import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefEntryComponent } from './coref-entry.component';

describe('CorefEntryComponent', () => {
  let component: CorefEntryComponent;
  let fixture: ComponentFixture<CorefEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorefEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
