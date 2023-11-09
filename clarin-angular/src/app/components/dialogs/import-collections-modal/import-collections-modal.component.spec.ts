import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportCollectionsModalComponent } from './import-modal.component';

describe('ImportCollectionsModalComponent', () => {
  let component: ImportCollectionsModalComponent;
  let fixture: ComponentFixture<ImportCollectionsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportCollectionsModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCollectionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
