import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationRelationComponent } from './annotation-relation.component';

describe('AnnotationRelationComponent', () => {
  let component: AnnotationRelationComponent;
  let fixture: ComponentFixture<AnnotationRelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationRelationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
