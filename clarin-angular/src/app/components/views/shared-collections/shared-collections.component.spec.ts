import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharedCollectionsComponent } from './manage-collections.component';

describe('SharedCollectionsComponent', () => {
  let component: SharedCollectionsComponent;
  let fixture: ComponentFixture<SharedCollectionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SharedCollectionsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
