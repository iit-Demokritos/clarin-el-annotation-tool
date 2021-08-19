import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectDocumentComponent } from './inspect-document.component';

describe('InspectDocumentComponent', () => {
  let component: InspectDocumentComponent;
  let fixture: ComponentFixture<InspectDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
