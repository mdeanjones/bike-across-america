import Interval from "./interval";

type Asset = {
  className:        string;
  scaleBounds:      [number, number];
  flippable?:       boolean;
  verticalJitter?:  number;
  spin?:            boolean;
  accelerate?:      boolean;
  reversed?:        boolean;
};

type Collection = {
  assets:     Asset[];
  spawnRate:  [number, number] | 0;
  scrollRate: [number, number] | 0;
}

export default class SideScroller {
  protected scrollerRoot: HTMLElement;
  protected intervals:    Interval[] = [];

  constructor(rootId = 'side-scroller') {
    this.scrollerRoot = document.getElementById(rootId) as HTMLElement;

    // It's your animation, and you want it now!
    const query = new URLSearchParams(document.location.search);

    switch (query.get('sidescroller')) {
      case 'keep-those-wheels-rolling':
        this.keepThoseWheelsRolling();
        break;

      case 'rest-those-tired-legs':
        this.restThoseTiredLegs();
        break;

      default:
        // Not really accurate at all, but simple.
        const currentHour = new Date().getHours();
        const ridingTime  = currentHour >= 7 && currentHour < 20;

        if (ridingTime) {
          this.keepThoseWheelsRolling();
        }
        else {
          this.restThoseTiredLegs();
        }
    }

    if (document.visibilityState === 'visible') {
      this.intervals.forEach(interval => interval.start(true));
    }

    document.addEventListener('visibilitychange', () => {
      document.visibilityState === 'visible' ? this.play() : this.pause();
    });

    this.scrollerRoot.addEventListener('animationend', (event: AnimationEvent) => {
      if (event.animationName === 'scroll-right-to-left' || event.animationName === 'scroll-left-to-right') {
        const target = event.target as HTMLElement;
        target.parentNode?.removeChild(target);
      }
    });
  }

  randomElement<T>(array: T[]): T {
    return array[this.randomInteger(0, array.length - 1)];
  }

  randomInteger(bounds: [number, number]): number;
  randomInteger(min: number, max: number): number;
  randomInteger(minOrBounds: number | [number, number], max?: number) {
    const [low, high] = Array.isArray(minOrBounds) ? minOrBounds : [minOrBounds, max ?? 0];
    return Math.floor(this.randomNumber(Math.ceil(low), Math.floor(high) + 1));
  }

  randomNumber(bounds: [number, number]): number;
  randomNumber(min: number, max: number): number;
  randomNumber(minOrBounds: number | [number, number], max?: number) {
    const [low, high] = Array.isArray(minOrBounds) ? minOrBounds : [minOrBounds, max ?? 0];
    return Math.random() * (high - low) + low;
  }

  /**
   * Resume all animations and paused timers.
   */
  protected play() {
    this.scrollerRoot.classList.remove('paused');
    this.intervals.forEach(interval => interval.start());
  }

  /**
   * Stop all animations and running timers.
   */
  protected pause() {
    this.scrollerRoot.classList.add('paused');
    this.intervals.forEach(interval => interval.stop());
  }

  /**
   * Configuration for the daytime.
   */
  protected keepThoseWheelsRolling() {
    this.initializeAnimatedLayer('air', undefined, {
      spawnRate:  [3000,  9000],
      scrollRate: [25000, 45000],
      assets: [
        { className: 'cloud',             scaleBounds: [0.05, 0.3], verticalJitter: 200 },
        { className: 'cloud',             scaleBounds: [0.05, 0.3], verticalJitter: 200 },
        { className: 'bird-flying-left',  scaleBounds: [0.05, 0.1], verticalJitter: 200, accelerate: true, flippable: false },
        { className: 'bird-flying-right', scaleBounds: [0.05, 0.1], verticalJitter: 200, accelerate: true, flippable: false, reversed: true },
      ],
    });

    this.initializeAnimatedLayer('staged', 80, {
      spawnRate:  [10000, 15000],
      scrollRate: [60000, 80000],
      assets: [
        { className: 'mountains', scaleBounds: [0.4, 1] },
      ],
    });

    this.initializeAnimatedLayer('air', undefined, {
      spawnRate:  [3000,  9000],
      scrollRate: [25000, 45000],
      assets: [
        { className: 'cloud',             scaleBounds: [0.05, 0.5], verticalJitter: 200 },
        { className: 'cloud',             scaleBounds: [0.05, 0.5], verticalJitter: 200 },
        { className: 'bird-flying-left',  scaleBounds: [0.05, 0.3], verticalJitter: 200, accelerate: true, flippable: false },
        { className: 'bird-flying-right', scaleBounds: [0.05, 0.3], verticalJitter: 200, accelerate: true, flippable: false, reversed: true },
      ],
    });

    this.initializeAnimatedLayer('staged', 45, {
      spawnRate:  [6000,  10000],
      scrollRate: [40000, 60000],
      assets: [
        { className: 'hills',     scaleBounds: [0.7, 1.5] },
        { className: 'hills',     scaleBounds: [0.7, 1.5] },
        { className: 'pine-tree', scaleBounds: [0.3, 0.5] },
        { className: 'oak-tree',  scaleBounds: [0.4, 0.6] },
      ],
    });

    this.initializeAnimatedLayer('earth', 10, {
      spawnRate:  [3000,  4000],
      scrollRate: [22000, 30000],
      assets: [
        { className: 'pine-tree',    scaleBounds: [0.5, 0.7] },
        { className: 'oak-tree',     scaleBounds: [0.5, 0.8] },
        { className: 'sign',         scaleBounds: [0.4, 0.5] },
        { className: 'cactus',       scaleBounds: [0.3, 0.4] },
        { className: 'tall-shrub',   scaleBounds: [0.3, 0.4] },
      ]
    });

    this.initializeStaticLayer('day', 22);

    this.initializeAnimatedLayer('staged', 10, {
      spawnRate:  [3000,  4000],
      scrollRate: [20000, 30000],
      assets:     [
        { className: 'tall-shrub',   scaleBounds: [0.15, 0.3] },
        { className: 'chubby-shrub', scaleBounds: [0.4, 0.5] },
        { className: 'grass-patch',  scaleBounds: [0.25, 0.35] },
        { className: 'grass-patch',  scaleBounds: [0.25, 0.35] }
      ],
    });

    this.scrollerRoot.classList.remove('nighttime');
    this.scrollerRoot.classList.add('daytime');
  }

  /**
   * Configuration for the night.
   */
  protected restThoseTiredLegs() {
    this.initializeAnimatedLayer('air', undefined, {
      spawnRate:  [3000,  10000],
      scrollRate: [70000, 90000],
      assets: [
        { className: 'cloud', scaleBounds: [0.05, 0.3], verticalJitter: 200 },
      ],
    });

    this.initializeAnimatedLayer('staged', 80, {
      spawnRate:  0,
      scrollRate: 0,
      assets: [
        { className: 'mountains', scaleBounds: [0.4, 0.85] },
      ]
    }, 10);

    this.initializeAnimatedLayer('air', undefined, {
      spawnRate:  [3000,  10000],
      scrollRate: [60000, 70000],
      assets: [
        { className: 'cloud', scaleBounds: [0.05, 0.5], verticalJitter: 200 },
      ],
    });

    this.initializeAnimatedLayer('staged', 45, {
      spawnRate:  0,
      scrollRate: 0,
      assets: [
        { className: 'pine-tree', scaleBounds: [0.5, 0.7] },
        { className: 'oak-tree',  scaleBounds: [0.5, 0.8] },
      ]
    }, 20);

    this.initializeStaticLayer('night', 10);

    this.scrollerRoot.appendChild(this.buildLayer('staged', 10));
    this.scrollerRoot.classList.remove('daytime');
    this.scrollerRoot.classList.add('nighttime');
  }

  /**
   * Build an animation layer, and set up an interval to keep it populated with
   * all sorts of fun stuff.
   */
  protected initializeAnimatedLayer(
    stage:       'staged' | 'earth' | 'air',
    stageHeight: number | undefined,
    collection:  Collection,
    initialPop?: number,
  ) {
    const layer = stage === 'air'
      ? this.buildLayer(stage)
      : this.buildLayer(stage, stageHeight ?? 0);

    const interval = Array.isArray(collection.spawnRate)
      ? new Interval({
        timeout:  this.randomInteger(collection.spawnRate),
        callback: () => this.insertAssetFromCollection(collection, layer),
      })
      : undefined;

    this.scrollerRoot.appendChild(layer);

    if (interval) {
      this.intervals.push(interval);
    }

    for (let i = 0; i < (initialPop ?? this.randomInteger(0, 4)); i += 1) {
      this.insertAssetFromCollection(collection, layer, true);
    }

    return { layer, interval };
  }

  /**
   * Build a static layer. One for day and the other for night.
   */
  protected initializeStaticLayer(stage: 'day' | 'night', stageHeight: number) {
    const layer    = this.buildLayer('earth', stageHeight);
    const scroller = layer.querySelector('.scroller');

    layer.classList.add('static-layer');

    // It is still a ".scroller" for layout purposes

    if (scroller) {
      if (stage === 'day') {
        scroller.innerHTML = `
          <div class="element the-daytime-firmament">
            <div class="the-sun"></div>
          </div>

          <div class="element bike-box">
            <div class="packing-materials">
              <div class="bicycle"></div>
            </div>
          </div>
        `;
      }
      else if (stage === 'night') {
        scroller.innerHTML = `
          <div class="element the-nighttime-firmament">
            <div class="star-field"></div>
            <div class="star-field"></div>
            <div class="star-field"></div>
            <div class="star-field"></div>
            <div class="star-field"></div>
            <div class="the-moon"></div>
          </div>

          <div class="nighttime-scene">
            <div class="element picnic-table"></div>
            <div class="element tent"></div>
            <div class="element campfire"></div>
          </div>
        `;
      }
    }

    this.scrollerRoot.appendChild(layer);

    return { layer };
  }

  /**
   * Spawns a new asset into the provided layer, and returns the pseudorandom millisecond
   * wait time until another asset should follow.
   */
  protected insertAssetFromCollection(
    collection:    Collection,
    layer:         HTMLElement,
    spawnInFlight: boolean = false
  ) {
    const asset       = this.randomElement(collection.assets);
    const nextSpawnMs = Array.isArray(collection.spawnRate)  ? this.randomInteger(collection.spawnRate) : 1000;
    const scrollMs    = Array.isArray(collection.scrollRate) ? this.randomInteger(collection.scrollRate) : 1000;
    const element     = this.createAssetElement(asset);

    if (!Array.isArray(collection.scrollRate)) {
      element.classList.add('paused');
    }

    const animateName = asset.reversed ? 'scroll-left-to-right' : 'scroll-right-to-left';
    const duration    = asset.accelerate ? scrollMs * this.randomNumber(0.2, 0.5) : scrollMs;

    layer.querySelector('.scroller')?.appendChild(
      this.splatStyles(element, {
        animation:      `${ animateName } ${ duration }ms linear`,
        animationDelay: spawnInFlight ? `-${ this.randomInteger(0, duration) }ms` : '',
      }),
    );

    return nextSpawnMs;
  }

  /**
   * Creates the initial elements for a single "layer". Visual elements are created inside of layers,
   * and the insertion ordering is used to dictate what appears overtop of what. Layers may be
   * of either "earth" or "air" which causes some variation in how things appear within them.
   * A "staged" layer is just a layer that has both a scroller and a "stage", which is a static,
   * styled element that provides a bit of visual panache to the items rolling by on top of it.
   */
  protected buildLayer(stage: 'air'): HTMLElement;
  protected buildLayer(stage: 'staged' | 'earth', stageHeight: number): HTMLElement;
  protected buildLayer(stage: 'staged' | 'earth' | 'air', stageHeight?: number) {
    const layerClasses = ['layer'];

    switch(stage) {
      case 'staged': layerClasses.push('earth-layer', 'stage-layer'); break;
      case 'earth':  layerClasses.push('earth-layer'); break;
      case 'air':    layerClasses.push('air-layer'); break;
    }

    const layerEl = this.createElement('div', layerClasses, { position: 'absolute', inset: '0' });

    layerEl.appendChild(
      this.createElement('div', 'scroller', {
        position: 'absolute',
        inset:    `0 0 ${ stage === 'air' ? '0' : ((stageHeight ?? 0) - 20) }px 0`,
      }),
    );

    if (stage === 'staged') {
      layerEl.appendChild(
        this.createElement('div', 'stage', {
          position: 'absolute',
          inset:    '0',
          top:      'unset',
          height:   `${ stageHeight }px`,
        }),
      );
    }

    return layerEl;
  }

  /**
   * Creates an HTMLElement, but they're the animated things that go scrolling across the page,
   * so they get their own method because there is a lot to figure out.
   */
  protected createAssetElement({ className, scaleBounds, flippable, verticalJitter, reversed }: Asset) {
    let transform = '';

    if (scaleBounds?.length) {
      const scale = scaleBounds.length > 1
        ? this.randomNumber(scaleBounds[0], scaleBounds[1])
        : scaleBounds[0];

      transform = `scale(${ scale })`;
    }

    if (typeof flippable !== 'boolean' && flippable !== false && this.randomInteger(0, 1) === 1) {
      transform += ' scaleX(-1)';
    }

    if (verticalJitter) {
      transform += ` translateY(${ this.randomInteger(verticalJitter * -1, verticalJitter) }px)`;
    }

    return this.createElement('div', ['element', className, reversed ? 'element-reversed' : ''], { transform });
  }

  /**
   * An ever so slightly less verbose `document.createElement` that bundles up some
   * repetitive tasks which this class needs to perform on elements that it creates.
   */
  protected createElement(tagName: string, className: string | string[], styles: Partial<CSSStyleDeclaration> = {}) {
    const el = this.splatStyles(document.createElement(tagName), styles);
    el.classList.add(...(Array.isArray(className) ? className : [className]).filter(Boolean));
    return el;
  }

  /**
   * Quickly slap a bunch of new style values onto an element.
   */
  protected splatStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    Object.entries(styles).forEach(([key, value]) => {
      // @ts-expect-error
      el.style[key] = value;
    });

    return el;
  }
}
