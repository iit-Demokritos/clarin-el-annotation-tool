import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationSetFilterComponent } from './text-widget-isolated.component';

describe('AnnotationSetFilterComponent', () => {
  let component: AnnotationSetFilterComponent;
  let fixture: ComponentFixture<AnnotationSetFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationSetFilterComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationSetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
