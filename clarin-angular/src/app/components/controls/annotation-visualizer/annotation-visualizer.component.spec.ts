import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationVisualizerComponent } from './annotation-visualizer.component';

describe('AnnotationVisualizerComponent', () => {
  let component: AnnotationVisualizerComponent;
  let fixture: ComponentFixture<AnnotationVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationVisualizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
