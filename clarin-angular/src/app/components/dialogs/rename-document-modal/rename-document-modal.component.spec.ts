import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RenameDocumentModalComponent } from './rename-document-modal.component';


describe('RenameDocumentModalComponent', () => {
  let component: RenameDocumentModalComponent;
  let fixture: ComponentFixture<RenameDocumentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RenameDocumentModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
