import { TestBed } from '@angular/core/testing';

import { NgxSmartCanvasService } from './ngx-smart-canvas.service';

describe('NgxSmartCanvasService', () => {
  let service: NgxSmartCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSmartCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
