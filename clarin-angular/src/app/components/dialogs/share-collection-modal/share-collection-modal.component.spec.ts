import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCollectionModalComponent } from './share-collection-modal.component';

describe('ShareCollectionModalComponent', () => {
  let component: ShareCollectionModalComponent;
  let fixture: ComponentFixture<ShareCollectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareCollectionModalComponent ]
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
