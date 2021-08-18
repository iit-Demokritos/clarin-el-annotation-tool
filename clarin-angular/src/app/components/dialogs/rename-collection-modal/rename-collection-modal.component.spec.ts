import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RenameCollectionModalComponent } from './rename-collection-modal.component';

describe('RenameCollectionModalComponent', () => {
  let component: RenameCollectionModalComponent;
  let fixture: ComponentFixture<RenameCollectionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RenameCollectionModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameCollectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
