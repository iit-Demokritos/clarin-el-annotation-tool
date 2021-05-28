import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationButtonComponent } from './annotation-button.component';

describe('AnnotationButtonComponent', () => {
  let component: AnnotationButtonComponent;
  let fixture: ComponentFixture<AnnotationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
