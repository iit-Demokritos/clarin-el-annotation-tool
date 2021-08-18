import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationTextTextComponent } from './annotation-text-text.component';

describe('AnnotationTextTextComponent', () => {
  let component: AnnotationTextTextComponent;
  let fixture: ComponentFixture<AnnotationTextTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationTextTextComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTextTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
