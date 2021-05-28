import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectOpenDocModalComponent } from './detect-open-doc-modal.component';

describe('DetectOpenDocModalComponent', () => {
  let component: DetectOpenDocModalComponent;
  let fixture: ComponentFixture<DetectOpenDocModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetectOpenDocModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectOpenDocModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
