import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCollectionsComponent } from './manage-collections.component';

describe('ManageCollectionsComponent', () => {
  let component: ManageCollectionsComponent;
  let fixture: ComponentFixture<ManageCollectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCollectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
