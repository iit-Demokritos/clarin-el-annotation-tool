import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlappingAreasComponent } from './overlapping-areas.component';

describe('OverlappingAreasComponent', () => {
  let component: OverlappingAreasComponent;
  let fixture: ComponentFixture<OverlappingAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverlappingAreasComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlappingAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
