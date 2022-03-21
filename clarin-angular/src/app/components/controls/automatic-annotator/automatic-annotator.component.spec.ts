import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticAnnotatorComponent } from './automatic-annotator.component';

describe('AutomaticAnnotatorComponent', () => {
  let component: AutomaticAnnotatorComponent;
  let fixture: ComponentFixture<AutomaticAnnotatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomaticAnnotatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomaticAnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
