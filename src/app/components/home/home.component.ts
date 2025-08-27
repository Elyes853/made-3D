import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    if (this.bgVideo?.nativeElement) {
      this.bgVideo.nativeElement.muted = true;
      this.bgVideo.nativeElement.defaultMuted = true;
      this.bgVideo.nativeElement.volume = 0; // double safety
      this.bgVideo.nativeElement.play().catch(err => {
        console.warn('Autoplay blocked:', err);
      });
    }
  }
}
