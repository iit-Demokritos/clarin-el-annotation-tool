import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectChangesModalComponent } from './detect-changes-modal.component';

describe('DetectChangesModalComponent', () => {
  let component: DetectChangesModalComponent;
  let fixture: ComponentFixture<DetectChangesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetectChangesModalComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectChangesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
