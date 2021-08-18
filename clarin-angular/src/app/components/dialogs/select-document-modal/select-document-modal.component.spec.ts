import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDocumentModalComponent } from './select-document-modal.component';

describe('SelectDocumentModalComponent', () => {
  let component: SelectDocumentModalComponent;
  let fixture: ComponentFixture<SelectDocumentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectDocumentModalComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
