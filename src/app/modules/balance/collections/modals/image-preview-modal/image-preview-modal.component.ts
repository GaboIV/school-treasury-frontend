import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationStrategy } from '@angular/common';

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

    .main-image {
      animation: fadeIn 0.3s ease-in-out;
      transition: all 0.3s ease;
      max-width: 100%;
      max-height: calc(100vh - 150px);
      object-fit: contain;
      margin: 0 auto;
      display: block;
      width: auto;
      height: auto;
    }

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 150px);
      overflow: hidden;
    }

    button {
      transition: all 0.2s;
    }

    button:hover {
      transform: scale(1.1);
    }

    .thumbnails-container {
      height: 80px;
      padding-bottom: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.3) transparent;
    }

    .thumbnails-container::-webkit-scrollbar {
      height: 6px;
    }

    .thumbnails-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .thumbnails-container::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,0.3);
      border-radius: 6px;
    }

    .thumbnail-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.6;
      filter: blur(1px);
    }

    .thumbnail-wrapper.active {
      border-color: var(--bs-primary);
      opacity: 1;
      filter: blur(0);
      transform: scale(1.05);
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.2s ease;
    }

    .thumbnail-image.active {
      filter: none;
    }

    .modal-content {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 1366px) {
      .main-image {
        max-height: calc(100vh - 180px);
      }

      .image-container {
        height: calc(100vh - 180px);
      }
    }
  `]
})
export class ImagePreviewModalComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() currentIndex: number = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    // Añadir clase al body para prevenir scroll
    document.body.classList.add('overflow-hidden');

    // Añadir event listener para teclas de navegación
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Agregar una entrada al historial para manejar el botón de retroceso
    // Usamos un identificador único para este modal
    this.locationStrategy.pushState(
      { modal: 'image-preview' },
      '',
      window.location.pathname,
      ''
    );
  }

  // Manejar el evento de navegación hacia atrás
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // Verificar si el estado del evento contiene información sobre el modal
    const state = window.history.state;

    // Solo cerrar este modal si el estado actual no tiene el identificador de este modal
    // o si el evento de popstate fue generado por el botón de atrás
    if (!state || !state.modal || state.modal !== 'image-preview') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Remover clase del body al cerrar
    document.body.classList.remove('overflow-hidden');

    // Remover event listener
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'Escape') {
      this.activeModal.dismiss();
    }
  }

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
