import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationIndicatorComponent } from './annotation-indicator.component';

describe('AnnotationIndicatorComponent', () => {
  let component: AnnotationIndicatorComponent;
  let fixture: ComponentFixture<AnnotationIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationIndicatorComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
