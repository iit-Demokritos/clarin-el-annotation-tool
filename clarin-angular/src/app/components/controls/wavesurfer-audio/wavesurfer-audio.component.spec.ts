import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WavesurferAudioComponent } from './wavesurfer-audio.component';

describe('WavesurferAudioComponent', () => {
  let component: WavesurferAudioComponent;
  let fixture: ComponentFixture<WavesurferAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WavesurferAudioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WavesurferAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
