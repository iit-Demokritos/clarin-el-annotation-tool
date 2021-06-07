import { TestBed } from '@angular/core/testing';

import { TextWidgetService } from './text-widget.service';

describe('TextWidgetService', () => {
  let service: TextWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
