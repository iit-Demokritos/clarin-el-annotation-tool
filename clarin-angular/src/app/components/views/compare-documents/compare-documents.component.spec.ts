import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareDocumentsComponent } from './compare-documents.component';

describe('CompareDocumentsComponent', () => {
  let component: CompareDocumentsComponent;
  let fixture: ComponentFixture<CompareDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
