import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router:Router) {
  }

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
  goToProducts(){
    this.router.navigate(["/products"])
  }
}
