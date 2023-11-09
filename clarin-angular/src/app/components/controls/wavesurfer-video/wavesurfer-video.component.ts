import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import WaveSurfer from "wavesurfer.js";
import WaveSurferRegions from "wavesurfer.js/dist/plugins/regions.js"
import WaveSurferMinimap from "wavesurfer.js/dist/plugins/minimap.js"
import WaveSurferTimeline from "wavesurfer.js/dist/plugins/timeline.js"
//import WaveSurferCursor from "wavesurfer.js/dist/plugins/cursor.js"
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'wavesurfer-video',
  templateUrl: './wavesurfer-video.component.html',
  styleUrls: ['./wavesurfer-video.component.scss']
})
export class WavesurferVideoComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  @ViewChild("video") video: ElementRef;
  @ViewChild("waveform") waveform: ElementRef;
  @ViewChild("wavetimeline") wavetimeline: ElementRef;

  @Input() src: string = null;
  @Output() event = new EventEmitter<string>();

  wavesurfer: any = null;
  wsRegions: any = null;

  selection: any = null;
  editAnnotationId: string = null;

  processEvents: boolean = true;

  state = {
    duration: 0,
    playing: false,
    error: false,
    volume: 0,
    zoom: 1
  };

  // Resize observer for refreshing zoom if parent size changes...
  resizeObserver: any;

  constructor(private toastrService: ToastrService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.wavesurfer = WaveSurfer.create({
      container: this.waveform.nativeElement,
      waveColor: "#97A0AF",
      progressColor: "#52c41a",
      cursorWidth: 1,
      cursorColor: "rgb(51, 51, 51)",
      height: 128,
      //responsive: true,
      fillParent: true,
      //pixelRatio: 1,
      //minPxPerSec: 100,
      //scrollParent: true,
      //normalize: true,
      //splitChannels: false,
      backend: 'MediaElement',
      barHeight: 1,
      plugins: [
          WaveSurferRegions.create(),
          WaveSurferMinimap.create({
              container: this.waveform.nativeElement,
              height: 30,
              waveColor: '#ddd',
              progressColor: '#999'
          }),
          WaveSurferTimeline.create({
              container: this.wavetimeline.nativeElement
          }),
          /*WaveSurferCursor.create({
            showTime: true,
            opacity: 1,
          })*/
      ]
    });
    this.wsRegions = this.wavesurfer.getActivePlugins()[0];
    this.wavesurfer.empty();
    this.wavesurfer.on('error', (e) => {
      this.toastrService.error(e, "Waveform Creation Error");
      console.warn("WavesurferVideoComponent:", e);
    });
 
    this.wavesurfer.on('ready', () => {
      this.wsRegions.enableDragSelection({
            color: "rgba(0, 0, 0, 0.1)"
        });
    });
    this.wavesurfer.on('region-click', (region, e) => {
        e.stopPropagation();
        // Play on click, loop on shift click
        e.shiftKey ? region.playLoop() : region.play();
    });
    if (this.wavesurfer.drawer != undefined) {
      this.wavesurfer.drawer.on('click',      this.clearSelection.bind(this));
    }
    this.wavesurfer.on('region-created',    this.createSelection.bind(this));
    this.wavesurfer.on('region-click',      this.editAnnotation.bind(this));
    this.wavesurfer.on('region-update-end', this.updateEndRegion.bind(this));
    this.wavesurfer.on('region-updated',    this.updateRegion.bind(this));
    this.wavesurfer.on('region-removed',    this.removeRegion.bind(this));
    this.wavesurfer.on('region-in',         this.showNote.bind(this));
    this.wavesurfer.on('region-out',        this.hideNote.bind(this));

    this.wavesurfer.on('pause', (region) => {
      this.state.playing = false;
    });
    this.wavesurfer.on('region-play', (region) => {
        region.once('out', () => {
            this.wavesurfer.play(region.start);
            this.pause();
        });
    });
    this.wavesurfer.on('waveform-ready', () => {
      this.state.volume = this.wavesurfer.getVolume();
    });
    this.video.nativeElement.addEventListener('loadeddata', this.onVideoDataLoaded.bind(this), {
      once: true
    });
    // create an Observer instance
    this.resizeObserver = new ResizeObserver((entries) => {
      this.state.zoom = 1;
      this.wavesurfer.zoom(this.state.zoom);
    });
    this.resizeObserver.observe(this.waveform.nativeElement);
  }; /* ngAfterViewInit */

  ngOnDestroy() {
    if (this.resizeObserver != undefined) {
      this.resizeObserver.disconnect();
    }
  } /* ngOnDestroy */

  onVideoDataLoaded() {
    // this.toastrService.info("Video has been loaded");
    // console.error("WavesurferVideoComponent: onVideoDataLoaded(): Video has been loaded");
    // this.wavesurfer.clearRegions();
    this.wavesurfer.load(this.video.nativeElement);
  }; /* onVideoDataLoaded */

  ngOnChanges(changes) {
    if ('src' in changes && this.src != null && this.wavesurfer != null) {
      // this.wavesurfer.load(this.video.nativeElement);
      // this.wavesurfer.load(this.src);
    }
  }; /* ngOnChanges */

  clearSelection() {
    if (!this.processEvents) return;
    this.wavesurfer.pause();
    if (this.selection != null) {
      this.selection.remove()
    }
    this.selection = null;
    this.event.emit("selection-clear");
  }; /* clearSelection */

  createSelection(region) {
    if (!this.processEvents) return;
    this.clearSelection();
    this.selection = region;
    this.event.emit("selection-create");
  }; /* addSelection */

  editAnnotation(region, e) {
    if (!this.processEvents) return;
    this.wavesurfer.pause();
    // e.stopPropagation();
    // e.preventDefault();
    this.editAnnotationId = region.id;
    this.event.emit("annotation-edit");
  }; /* editAnnotation */

  updateRegion(region) {
    if (!this.processEvents) return;
    this.event.emit("selection-updated");
  }; /* updateRegion */

  updateEndRegion(region) {
    if (!this.processEvents) return;
    this.event.emit("selection-update-end");
    this.event.emit("selection-add");
  }; /* updateEndRegion */

  removeRegion(region) {
    if (!this.processEvents) return;
    this.event.emit("selection-remove");
  }; /* removeRegion */

  addRegion(id, span, colorCombination, selected) {
    // console.error("WavesurferVideoComponent: addRegion():", id, span, colorCombination, selected);
    this.removeRegionForAnnotationId(id);
    this.processEvents = false;
    var region = this.wavesurfer.addRegion({
      id:    id,
      start: span.start,
      end:   span.end,
      drag:  false,
      resize: false,
      color: selected ? colorCombination.colour_selected_background : colorCombination.colour_background
    });
    region.element.style.setProperty("--border-color", colorCombination.colour_border)
    if (selected) {
      region.element.classList.add('selected');
    }
    this.processEvents = true;
    // console.error("List:", this.wavesurfer.regions.list);
  }; /* addRegion */

  removeRegionForAnnotationId(id) {
    // console.error("WavesurferVideoComponent: removeRegionForAnnotationId(): ==", id);
    if (id in this.wavesurfer.regions.list) {
      // console.error(">>", this.wavesurfer.regions.list[id]);
      this.processEvents = false;
      this.wavesurfer.regions.list[id].remove();
      delete this.wavesurfer.regions.list[id];
      this.processEvents = true;
      // console.error("WavesurferVideoComponent: removeRegionForAnnotationId():", id, this.wavesurfer.regions.list);
    }
    // console.error("KEYS:", Object.keys(this.wavesurfer.regions.list));
  }; /* removeRegionForAnnotationId */

  scrollIntoView(id) {
    if (id in this.wavesurfer.regions.list) {
      var region = this.wavesurfer.regions.list[id];
      this.wavesurfer.setCurrentTime(region.start);
    }
  }; /* scrollIntoView */

  showNote(region) {
  }; /* showNote */

  hideNote(region) {
  }; /* hideNote */

  play() {
    this.wavesurfer.play();
    this.state.playing = true;
  }

  pause() {
    this.wavesurfer.pause();
    this.state.playing = false;
  }

  previous() {
    this.wavesurfer.seekTo(0);
  }

  next() {
    this.wavesurfer.seekTo(1);
  }

  onZoomChangeEnd(event) {
    this.wavesurfer.zoom(event.value);
  }

  zoomOut() {
    this.state.zoom -= 20;
    if (this.state.zoom < 0) this.state.zoom = 0;
    this.wavesurfer.zoom(this.state.zoom);
  }

  zoomIn() {
    this.state.zoom += 20;
    if (this.state.zoom >200) this.state.zoom = 200;
    this.wavesurfer.zoom(this.state.zoom);
  }

  onVolumeChangeEnd(event) {
    this.wavesurfer.setVolume(event.value);
  }

  mute() {
    this.state.volume = 0;
    this.wavesurfer.setVolume(this.state.volume);
  }

  volumeUp() {
    this.state.volume += 0.1;
    if (this.state.volume > 1) this.state.volume = 1;
    this.wavesurfer.setVolume(this.state.volume);
  }

}
