import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportDocumentsFromExportModalComponent } from './import-documents-from-export-modal.component';

describe('ImportDocumentsFromExportModalComponent', () => {
  let component: ImportDocumentsFromExportModalComponent;
  let fixture: ComponentFixture<ImportDocumentsFromExportModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportDocumentsFromExportModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDocumentsFromExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
