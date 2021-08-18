import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationButtonCustomValueAddComponent } from './annotation-button.component';

describe('AnnotationButtonCustomValueAddComponent', () => {
  let component: AnnotationButtonCustomValueAddComponent;
  let fixture: ComponentFixture<AnnotationButtonCustomValueAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationButtonCustomValueAddComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationButtonCustomValueAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
