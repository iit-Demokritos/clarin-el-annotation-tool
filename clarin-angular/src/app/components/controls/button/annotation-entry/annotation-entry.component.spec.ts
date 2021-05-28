import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationEntryComponent } from './annotation-entry.component';

describe('AnnotationEntryComponent', () => {
  let component: AnnotationEntryComponent;
  let fixture: ComponentFixture<AnnotationEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
