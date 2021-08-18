import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorefImportBtnComponent } from './coref-import-btn.component';

describe('CorefImportBtnComponent', () => {
  let component: CorefImportBtnComponent;
  let fixture: ComponentFixture<CorefImportBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorefImportBtnComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorefImportBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
