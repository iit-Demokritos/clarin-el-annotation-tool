import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarWidgetComponent } from './toolbar-widget.component';

describe('ToolbarWidgetComponent', () => {
  let component: ToolbarWidgetComponent;
  let fixture: ComponentFixture<ToolbarWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolbarWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
