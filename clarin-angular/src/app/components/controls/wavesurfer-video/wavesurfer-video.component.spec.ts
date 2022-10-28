import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WavesurferVideoComponent } from './wavesurfer-video.component';

describe('WavesurferVideoComponent', () => {
  let component: WavesurferVideoComponent;
  let fixture: ComponentFixture<WavesurferVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WavesurferVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WavesurferVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
