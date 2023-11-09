import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiseAnnotationComponent } from './visualise-annotation.component';

describe('VisualiseAnnotationComponent', () => {
  let component: VisualiseAnnotationComponent;
  let fixture: ComponentFixture<VisualiseAnnotationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisualiseAnnotationComponent]
    });
    fixture = TestBed.createComponent(VisualiseAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
