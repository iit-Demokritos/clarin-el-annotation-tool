import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarSelectAnnotatorComponent } from './toolbar-select-annotator.component';

describe('ToolbarSelectAnnotatorComponent', () => {
  let component: ToolbarSelectAnnotatorComponent;
  let fixture: ComponentFixture<ToolbarSelectAnnotatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolbarSelectAnnotatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarSelectAnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
