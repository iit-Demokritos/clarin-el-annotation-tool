import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsAnnotationValuesComponent } from './inspect-document.component';

describe('AnalyticsAnnotationValuesComponent', () => {
  let component: AnalyticsAnnotationValuesComponent;
  let fixture: ComponentFixture<AnalyticsAnnotationValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsAnnotationValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsAnnotationValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
