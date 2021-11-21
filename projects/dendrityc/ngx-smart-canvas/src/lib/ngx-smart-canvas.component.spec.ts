import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSmartCanvasComponent } from './ngx-smart-canvas.component';

describe('NgxSmartCanvasComponent', () => {
  let component: NgxSmartCanvasComponent;
  let fixture: ComponentFixture<NgxSmartCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxSmartCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSmartCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
