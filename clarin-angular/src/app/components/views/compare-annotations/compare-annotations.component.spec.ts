import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareAnnotationsComponent } from './compare-annotations.component';

describe('CompareAnnotationsComponent', () => {
  let component: CompareAnnotationsComponent;
  let fixture: ComponentFixture<CompareAnnotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareAnnotationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
