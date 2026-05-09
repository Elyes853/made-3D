import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { LithophaneService } from '../../services/lithophane.service';

export type ShapeType = 'square' | 'circle' | 'heart';

export interface LithophaneAdjustments {
  rotation: number;
  scale: number;
  translateX: number;
  translateY: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  grayscale: number;
}

export interface LithophaneShape {
  id: ShapeType;
  label: string;
  description: string;
}

@Component({
  selector: 'app-lithophane',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lithophane.component.html',
  styleUrl: './lithophane.component.scss',
})
export class LithophaneComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imageUrl: string | null = null;
  isDragOver = false;
  isProcessing = false;
  addedToCart = false;
  selectedShape: ShapeType | null = null;
  readonly price = 20;
  adj: LithophaneAdjustments = this.defaultAdj();
  readonly shapes: LithophaneShape[] = [
    { id: 'square', label: 'Carre', description: '4 x 4 cm' },
    { id: 'circle', label: 'Cercle', description: '4 cm' },
    // { id: 'heart', label: 'Coeur', description: '4 x 4 cm' },
  ];
  constructor(
    private cartService: CartService,
    private lithophaneService: LithophaneService,
  ) {}
  defaultAdj(): LithophaneAdjustments {
    return {
      rotation: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      flipH: false,
      flipV: false,
      brightness: 100,
      contrast: 130,
      grayscale: 100,
    };
  }
  resetAdjustments() {
    this.adj = this.defaultAdj();
  }

  // ── Drag / pinch-to-zoom interaction ─────────────────────────────────────
  isInteracting = false;
  private _dragActive = false;
  private _dragPointerId: number | null = null;
  private _dragStart = { x: 0, y: 0, tx: 0, ty: 0 };
  private _frameSize = 0;
  private _pinchPointers = new Map<number, { x: number; y: number }>();
  private _pinchStartDist = 0;
  private _pinchStartScale = 1;
  private _pinchStartMid = { x: 0, y: 0 };
  private _pinchStartTx = 0;
  private _pinchStartTy = 0;

  onFramePointerDown(event: PointerEvent, el: HTMLElement): void {
    event.preventDefault();
    el.setPointerCapture(event.pointerId);
    this.isInteracting = true;
    this._pinchPointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    this._frameSize = el.getBoundingClientRect().width;

    if (this._pinchPointers.size === 2) {
      // Transition from drag to pinch
      this._dragActive = false;
      const [a, b] = [...this._pinchPointers.values()];
      this._pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      this._pinchStartScale = this.adj.scale;
      this._pinchStartMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this._pinchStartTx = this.adj.translateX;
      this._pinchStartTy = this.adj.translateY;
    } else {
      this._dragActive = true;
      this._dragPointerId = event.pointerId;
      this._dragStart = {
        x: event.clientX,
        y: event.clientY,
        tx: this.adj.translateX,
        ty: this.adj.translateY,
      };
    }
  }

  onFramePointerMove(event: PointerEvent): void {
    if (!this._pinchPointers.has(event.pointerId)) return;
    event.preventDefault();
    this._pinchPointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (this._pinchPointers.size === 2) {
      const [a, b] = [...this._pinchPointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      this.adj.scale = Math.max(
        0.4,
        Math.min(2.2, this._pinchStartScale * (dist / this._pinchStartDist)),
      );
      // Pan with the midpoint
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      this.adj.translateX =
        this._pinchStartTx +
        ((midX - this._pinchStartMid.x) / this._frameSize) * 100;
      this.adj.translateY =
        this._pinchStartTy +
        ((midY - this._pinchStartMid.y) / this._frameSize) * 100;
    } else if (this._dragActive && event.pointerId === this._dragPointerId) {
      const dx = event.clientX - this._dragStart.x;
      const dy = event.clientY - this._dragStart.y;
      this.adj.translateX = this._dragStart.tx + (dx / this._frameSize) * 100;
      this.adj.translateY = this._dragStart.ty + (dy / this._frameSize) * 100;
    }
  }

  onFramePointerUp(event: PointerEvent): void {
    this._pinchPointers.delete(event.pointerId);
    if (event.pointerId === this._dragPointerId) {
      this._dragActive = false;
      this._dragPointerId = null;
    }
    // If going from 2-finger pinch down to 1 finger, restart drag from current position
    if (this._pinchPointers.size === 1) {
      const [remaining] = [...this._pinchPointers.entries()];
      this._dragActive = true;
      this._dragPointerId = remaining[0];
      this._dragStart = {
        x: remaining[1].x,
        y: remaining[1].y,
        tx: this.adj.translateX,
        ty: this.adj.translateY,
      };
    }
    if (this._pinchPointers.size === 0) {
      this.isInteracting = false;
    }
  }

  onFrameWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    this.adj.scale = Math.max(0.4, Math.min(2.2, this.adj.scale + delta));
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  getPreviewTransform(): string {
    const { rotation, scale, translateX, translateY, flipH, flipV } = this.adj;
    return (
      'translate(' +
      translateX +
      '%,' +
      translateY +
      '%) rotate(' +
      rotation +
      'deg) scale(' +
      scale * (flipH ? -1 : 1) +
      ',' +
      scale * (flipV ? -1 : 1) +
      ')'
    );
  }
  getPreviewFilter(): string {
    return (
      'brightness(' +
      this.adj.brightness +
      '%) contrast(' +
      this.adj.contrast +
      '%) grayscale(' +
      this.adj.grayscale +
      '%)'
    );
  }
  getShapeClass(): string {
    return this.selectedShape ? 'shape-' + this.selectedShape : '';
  }
  clearImage(): void {
    this.imageUrl = null;
    this.adj = this.defaultAdj();
    this.selectedShape = null;
    this.addedToCart = false;
    this.fileInput.nativeElement.value = '';
  }
  get selectedShapeLabel(): string {
    return this.shapes.find((s) => s.id === this.selectedShape)?.label ?? '';
  }
  onFileSelected(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.loadFile(f);
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  onDragLeave() {
    this.isDragOver = false;
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const f = event.dataTransfer?.files[0];
    if (f?.type.startsWith('image/')) this.loadFile(f);
  }
  loadFile(file: File) {
    const r = new FileReader();
    r.onload = (e) => {
      this.imageUrl = e.target?.result as string;
      this.adj = this.defaultAdj();
    };
    r.readAsDataURL(file);
  }
  async addToCart() {
    if (!this.imageUrl || !this.selectedShape || this.isProcessing) return;
    this.isProcessing = true;
    const shape = this.selectedShape;
    const shapeLabel = this.shapes.find((s) => s.id === shape)!.label;
    try {
      const [processedUrl, thumbUrl] = await Promise.all([
        this.processImage(this.imageUrl, this.adj, shape, 900),
        this.createThumbnail(this.imageUrl, 120, shape),
      ]);
      const lithoId = crypto.randomUUID
        ? crypto.randomUUID()
        : 'litho_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      this.lithophaneService.storeImage(lithoId, processedUrl);
      this.cartService.addToCart({
        id: Date.now(),
        name: 'Lithophane ' + shapeLabel + ' 4x4cm',
        price: this.price,
        image: thumbUrl,
        variant: 'litho:' + lithoId + ':' + shape,
        type: 'lithophane',
      });
      this.addedToCart = true;
      setTimeout(() => (this.addedToCart = false), 3500);
    } finally {
      this.isProcessing = false;
    }
  }
  private processImage(
    dataUrl: string,
    adj: LithophaneAdjustments,
    shape: ShapeType,
    maxPx: number,
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const size = maxPx;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.save();
        this.applyShapeClip(ctx, size, shape);
        ctx.filter =
          'brightness(' + adj.brightness + '%) contrast(' + adj.contrast + '%)';
        // Match CSS object-fit: contain — fit the image within the frame
        const fitScale = Math.min(
          size / img.naturalWidth,
          size / img.naturalHeight,
        );
        ctx.translate(size / 2, size / 2);
        ctx.translate(
          (adj.translateX / 100) * size,
          (adj.translateY / 100) * size,
        );
        ctx.rotate((adj.rotation * Math.PI) / 180);
        ctx.scale(
          adj.scale * (adj.flipH ? -1 : 1),
          adj.scale * (adj.flipV ? -1 : 1),
        );
        const dW = img.naturalWidth * fitScale;
        const dH = img.naturalHeight * fitScale;
        ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();
        if (adj.grayscale > 0) {
          ctx.filter = 'none';
          const id = ctx.getImageData(0, 0, size, size);
          const d = id.data;
          const f = adj.grayscale / 100;
          for (let i = 0; i < d.length; i += 4) {
            const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            d[i] = d[i] * (1 - f) + g * f;
            d[i + 1] = d[i + 1] * (1 - f) + g * f;
            d[i + 2] = d[i + 2] * (1 - f) + g * f;
          }
          ctx.putImageData(id, 0, 0);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = dataUrl;
    });
  }
  private applyShapeClip(
    ctx: CanvasRenderingContext2D,
    s: number,
    shape: ShapeType,
  ): void {
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    } else if (shape === 'heart') {
      this.heartPath(ctx, s);
    } else {
      ctx.rect(0, 0, s, s);
    }
    ctx.clip();
  }
  private heartPath(ctx: CanvasRenderingContext2D, s: number): void {
    const cx = s / 2,
      cy = s / 2,
      sc = s * 0.4;
    ctx.moveTo(cx, cy - sc * 0.3);
    ctx.bezierCurveTo(
      cx - sc * 0.5,
      cy - sc * 0.8,
      cx - sc,
      cy - sc * 0.5,
      cx - sc,
      cy,
    );
    ctx.bezierCurveTo(
      cx - sc,
      cy + sc * 0.5,
      cx,
      cy + sc * 0.9,
      cx,
      cy + sc * 0.9,
    );
    ctx.bezierCurveTo(cx, cy + sc * 0.9, cx + sc, cy + sc * 0.5, cx + sc, cy);
    ctx.bezierCurveTo(
      cx + sc,
      cy - sc * 0.5,
      cx + sc * 0.5,
      cy - sc * 0.8,
      cx,
      cy - sc * 0.3,
    );
    ctx.closePath();
  }
  private createThumbnail(
    dataUrl: string,
    size: number,
    shape: ShapeType,
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.save();
        this.applyShapeClip(ctx, size, shape);
        const ratio = Math.max(
          size / img.naturalWidth,
          size / img.naturalHeight,
        );
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(
          img,
          (size - img.naturalWidth * ratio) / 2,
          (size - img.naturalHeight * ratio) / 2,
          img.naturalWidth * ratio,
          img.naturalHeight * ratio,
        );
        ctx.restore();
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = dataUrl;
    });
  }
}
