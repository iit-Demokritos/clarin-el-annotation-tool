import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationSetComparatorComponent } from './annotation-set-comparator.component';

describe('AnnotationSetComparatorComponent', () => {
  let component: AnnotationSetComparatorComponent;
  let fixture: ComponentFixture<AnnotationSetComparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationSetComparatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationSetComparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
