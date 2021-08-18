import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomValueModalComponent } from './detect-changes-modal.component';

describe('AddCustomValueModalComponent', () => {
  let component: AddCustomValueModalComponent;
  let fixture: ComponentFixture<AddCustomValueModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCustomValueModalComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomValueModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
