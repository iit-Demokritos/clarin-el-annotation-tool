import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareCollectionsComponent } from './compare-collections.component';

describe('CompareCollectionsComponent', () => {
  let component: CompareCollectionsComponent;
  let fixture: ComponentFixture<CompareCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareCollectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
