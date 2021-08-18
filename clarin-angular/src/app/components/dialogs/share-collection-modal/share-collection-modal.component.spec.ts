import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareCollectionModalComponent } from './share-collection-modal.component';

describe('ShareCollectionModalComponent', () => {
  let component: ShareCollectionModalComponent;
  let fixture: ComponentFixture<ShareCollectionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ShareCollectionModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareCollectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
