import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextWidgetIsolatedComponent } from './text-widget-isolated.component';

describe('TextWidgetIsolatedComponent', () => {
  let component: TextWidgetIsolatedComponent;
  let fixture: ComponentFixture<TextWidgetIsolatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextWidgetIsolatedComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextWidgetIsolatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
