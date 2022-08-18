export default class Lightbox {
  public readonly thumbnails:   HTMLImageElement[];
  public readonly prevButton:   HTMLButtonElement;
  public readonly nextButton:   HTMLButtonElement;
  public readonly closeButton:  HTMLButtonElement;
  public readonly backdrop:     HTMLElement;
  public readonly container:    HTMLElement;
  public readonly contentBox:   HTMLElement;
  public readonly loadingIcon:  HTMLElement;
  public readonly fullResImage: HTMLImageElement;

  protected currentThumb?: HTMLImageElement;

  constructor(container: string) {
    const elements = this.buildUI();

    this.prevButton   = elements.prevButton;
    this.nextButton   = elements.nextButton;
    this.closeButton  = elements.closeButton;
    this.backdrop     = elements.backdrop;
    this.container    = elements.container;
    this.contentBox   = elements.contentBox;
    this.loadingIcon  = elements.loadingIcon;
    this.fullResImage = elements.fullResImage;
    this.thumbnails   = [...document.querySelectorAll(`${ container } img`)] as HTMLImageElement[];

    this.prevButton.addEventListener('click', () => this.prevImage());
    this.nextButton.addEventListener('click', () => this.nextImage());
    this.closeButton.addEventListener('click', () => this.closeLightbox());

    document.querySelector(container)?.addEventListener('click', async (e) => {
      if (e.target instanceof HTMLImageElement) {
        await this.loadImage(e.target);
      }
    });
  }

  public get isOpen() {
    return this.container.classList.contains('show');
  }

  protected get hasPrev() {
    return this.currentThumbIdx() - 1 > -1;
  }

  protected get hasNext() {
    return this.currentThumbIdx() + 1 < this.thumbnails.length;
  }

  protected thumbIdx(thumbnail?: HTMLImageElement) {
    return (thumbnail && this.thumbnails.indexOf(thumbnail)) ?? -1;
  }

  protected currentThumbIdx() {
    return this.thumbIdx(this.currentThumb);
  }

  protected getScrollbarWidth() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
    const documentWidth = document.documentElement.clientWidth;
    return Math.abs(window.innerWidth - documentWidth);
  }

  protected toggleOpacity(element: HTMLElement, direction: 'up' | 'down') {
    const className = 'show';

    return new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        const transitionEndCallback = (e: TransitionEvent) => {
          if (e.propertyName === 'opacity') {
            element.removeEventListener('transitionend', transitionEndCallback);
            resolve(undefined);
          }
        };

        element.addEventListener('transitionend', transitionEndCallback);
        element.classList[direction === 'up' ? 'add' : 'remove'](className);
      });
    });
  }

  protected async openLightbox() {
    if (!this.isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingLeft = `${ this.getScrollbarWidth() }px`;

      this.backdrop.style.display  = 'block';
      this.container.style.display = 'block';

      await Promise.all([
        this.toggleOpacity(this.container, 'up'),
        this.toggleOpacity(this.backdrop,  'up'),
      ]);
    }
  }

  protected async closeLightbox() {
    await Promise.all([
      this.toggleOpacity(this.container, 'down'),
      this.toggleOpacity(this.backdrop,  'down'),
    ]);

    this.backdrop.style.display    = 'none';
    this.container.style.display   = 'none';
    this.loadingIcon.style.display = 'block';
    this.fullResImage.src          = '';

    document.body.classList.remove('modal-open');
    document.body.style.overflow    = '';
    document.body.style.paddingLeft = '';
  }

  protected async loadImage(thumbnail: HTMLImageElement) {
    await this.openLightbox();

    const fullResSource = thumbnail.getAttribute('data-full-res');

    this.currentThumb        = thumbnail;
    this.fullResImage.src    = fullResSource ?? '';
    this.prevButton.disabled = !this.hasPrev;
    this.nextButton.disabled = !this.hasNext;
  }

  protected async prevImage() {
    const idx = this.currentThumbIdx();

    if (idx > 0) {
      await this.loadImage(this.thumbnails[idx - 1]);
    }
  }

  protected async nextImage() {
    const idx = this.currentThumbIdx();

    if (idx + 1 < this.thumbnails.length) {
      await this.loadImage(this.thumbnails[idx + 1]);
    }
  }

  protected buildUI() {
    const backdrop  = document.createElement('div');
    const container = document.createElement('div');

    backdrop.classList.add('modal-backdrop', 'fade');
    backdrop.style.display = 'none';

    container.classList.add('lightbox-overlay', 'fade');
    container.style.display = 'none';
    container.innerHTML = `
      <div class="d-flex justify-content-center my-4">
        <button class="btn btn-light mx-1 px-5 prev-button" aria-label="Previous" title="Previous">&laquo;</button>
        <button class="btn btn-light mx-3 close-button" aria-label="Close" title="Close">&times;</button>
        <button class="btn btn-light mx-1 px-5 next-button" aria-label="Next" title="Next">&raquo;</button>
      </div>

      <div class="lightbox">
        <div class="load-indicator position-absolute start-50 translate-middle-x py-2" style="display: none">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <img />
      </div>
    `;

    document.body.append(backdrop, container);

    return {
      backdrop,
      container,
      prevButton:   container.querySelector('.prev-button')    as HTMLButtonElement,
      nextButton:   container.querySelector('.next-button')    as HTMLButtonElement,
      closeButton:  container.querySelector('.close-button')   as HTMLButtonElement,
      contentBox:   container.querySelector('.lightbox')       as HTMLElement,
      loadingIcon:  container.querySelector('.load-indicator') as HTMLElement,
      fullResImage: container.querySelector('img')             as HTMLImageElement,
    };
  }
}
