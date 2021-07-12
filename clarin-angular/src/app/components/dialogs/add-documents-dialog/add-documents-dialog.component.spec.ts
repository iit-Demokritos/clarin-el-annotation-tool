import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddDocumentsDialogComponent } from './add-documents-dialog.component';

describe('AddDocumentsDialogComponent', () => {
  let component: AddDocumentsDialogComponent;
  let fixture: ComponentFixture<AddDocumentsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDocumentsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDocumentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
