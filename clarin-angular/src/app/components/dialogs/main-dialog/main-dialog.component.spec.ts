import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MainDialogComponent } from './main-dialog.component';

describe('MainDialogComponent', () => {
  let component: MainDialogComponent;
  let fixture: ComponentFixture<MainDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MainDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
