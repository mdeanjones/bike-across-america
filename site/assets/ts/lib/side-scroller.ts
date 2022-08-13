import Interval from "./interval";

type Asset = {
  className:       string;
  scaleBounds:     [number, number];
  flippable?:      boolean;
  verticalJitter?: number;
  spin?:           boolean;
  accelerate?:     boolean;
};

type Collection = {
  assets:     Asset[];
  spawnRate:  [number, number];
  scrollRate: [number, number];
}

const Clouds: Collection = {
  spawnRate:  [3000, 9000],
  scrollRate: [30000, 33000],
  assets: [
    { className: 'cloud', scaleBounds: [0.05, 0.3], flippable: true, verticalJitter: 200 },
  ],
};

const Terrain: Collection = {
  spawnRate:  [15000, 30000],
  scrollRate: [40000, 60000],
  assets: [
    { className: 'hills',     scaleBounds: [0.2, 0.5],  flippable: true },
    { className: 'mountains', scaleBounds: [0.3, 0.65], flippable: true },
  ],
};

const Background: Collection = {
  spawnRate:  [10000, 15000],
  scrollRate: [25000, 35000],
  assets: [
    { className: 'pine-tree',    scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'oak-tree',     scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'cactus',       scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.2, 0.5], flippable: true },
  ],
};

const Foreground: Collection = {
  spawnRate:  [80000, 13000],
  scrollRate: [18000, 27000],
  assets: [
    { className: 'cactus',       scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'grass-patch',  scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tumbleweed',   scaleBounds: [0.2, 0.4], flippable: true, spin: true, accelerate: true },
  ]
};

export default class SideScroller {
  protected scrollerRoot:     HTMLElement;
  protected skyLayers:        NodeListOf<HTMLElement>;
  protected terrainLayers:    NodeListOf<HTMLElement>;
  protected backgroundLayers: NodeListOf<HTMLElement>;
  protected foregroundLayers: NodeListOf<HTMLElement>;
  protected intervals:        Interval[];

  constructor(rootId = 'side-scroller') {
    this.scrollerRoot     = document.getElementById(rootId) as HTMLElement;
    this.skyLayers        = this.scrollerRoot.querySelectorAll('.sky-layer .scroller');
    this.terrainLayers    = this.scrollerRoot.querySelectorAll('.terrain-layer .scroller');
    this.backgroundLayers = this.scrollerRoot.querySelectorAll('.ground-layer.background-layer .scroller');
    this.foregroundLayers = this.scrollerRoot.querySelectorAll('.ground-layer.foreground-layer .scroller');

    this.intervals = [
      new Interval({
        timeout:  this.randomInteger(Clouds.spawnRate),
        callback: () => this.insertElementFromCollection(Clouds, this.skyLayers),
      }),

      new Interval({
        timeout:  this.randomInteger(Terrain.spawnRate),
        callback: () => this.insertElementFromCollection(Terrain, this.terrainLayers),
      }),

      new Interval({
        timeout:  this.randomInteger(Background.spawnRate),
        callback: () => this.insertElementFromCollection(Background, this.backgroundLayers),
      }),

      new Interval({
        timeout:  this.randomInteger(Foreground.spawnRate),
        callback: () => this.insertElementFromCollection(Foreground, this.foregroundLayers),
      }),
    ];

    this.intervals.forEach(interval => interval.start(true));

    this.scrollerRoot.addEventListener('animationend', (event: AnimationEvent) => {
      if (event.animationName === 'scroll-right-to-left') {
        const target = event.target as HTMLElement;
        target.parentNode?.removeChild(target);
      }
    });

    document.addEventListener('visibilitychange', () => {
      this.intervals.forEach(
        interval => document.visibilityState === 'visible' ? interval.start() : interval.stop(),
      );
    });
  }

  insertElementFromCollection(collection: Collection, layers: NodeListOf<HTMLElement>) {
    const layerIdx    = this.randomInteger(0, layers.length - 1);
    const element     = this.createRandomElement(collection.assets);
    const nextSpawnMs = this.randomInteger(collection.spawnRate);
    const scrollMs    = this.randomInteger(collection.scrollRate);

    element.style.animationDuration = `${ scrollMs - (layerIdx * scrollMs * 0.1) }ms`;

    layers[layerIdx].appendChild(element);

    setTimeout(
      () => this.insertElementFromCollection(collection, layers),
      nextSpawnMs,
    );

    return nextSpawnMs;
  }

  createRandomElement(array: unknown[]) {
    // @ts-expect-error
    return this.createElement(this.randomElement(array));
  }

  createElement({ className, scaleBounds, flippable, verticalJitter }: { className: string, scaleBounds: [number, number], flippable?: boolean, verticalJitter?: number }) {
    const el = document.createElement('div');
    el.classList.add('element', className);

    if (scaleBounds?.length) {
      const scale = scaleBounds.length > 1
        ? this.randomNumber(scaleBounds[0], scaleBounds[1])
        : scaleBounds[0];

      el.style.transform = `scale(${ scale })`;
    }

    if (flippable && this.randomInteger(0, 1) === 1) {
      el.style.transform += ' scaleX(-1)';
    }

    if (verticalJitter) {
      el.style.transform += ` translateY(${ this.randomInteger(verticalJitter * -1, verticalJitter) }px)`;
    }

    return el;
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
}
