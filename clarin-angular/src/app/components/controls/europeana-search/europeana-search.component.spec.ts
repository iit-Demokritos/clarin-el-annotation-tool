import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EuropeanaSearchComponent } from './europeana-search.component';

describe('EuropeanaSearchComponent', () => {
  let component: EuropeanaSearchComponent;
  let fixture: ComponentFixture<EuropeanaSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EuropeanaSearchComponent]
    });
    fixture = TestBed.createComponent(EuropeanaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
