import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styles: [`
    .image-preview-modal {
      z-index: 1060;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .img-thumbnail {
      transition: transform 0.2s;
    }

    .img-thumbnail:hover {
      transform: scale(1.05);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    img {
      animation: fadeIn 0.3s ease-in-out;
    }

    button {
      transition: all 0.2s;
    }

    button:hover {
      transform: scale(1.1);
    }
  `]
})
export class ImagePreviewModalComponent {
  @Input() images: string[] = [];
  @Input() currentIndex: number = 0;

  constructor(public activeModal: NgbActiveModal) {}

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.images[this.currentIndex];
    link.download = `imagen-${this.currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
