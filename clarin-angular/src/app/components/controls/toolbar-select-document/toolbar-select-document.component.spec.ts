import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarSelectDocumentComponent } from './toolbar-select-document.component';

describe('ToolbarSelectDocumentComponent', () => {
  let component: ToolbarSelectDocumentComponent;
  let fixture: ComponentFixture<ToolbarSelectDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolbarSelectDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarSelectDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
