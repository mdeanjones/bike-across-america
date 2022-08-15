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
  spawnRate:  [number, number];
  scrollRate: [number, number];
}

const Sky: Collection = {
  spawnRate:  [3000,  9000],
  scrollRate: [25000, 45000],
  assets: [
    { className: 'cloud',             scaleBounds: [0.05, 0.7], flippable: true, verticalJitter: 200 },
    { className: 'bird-flying-left',  scaleBounds: [0.05, 0.3], verticalJitter: 200, accelerate: true },
    {
      className:      'bird-flying-right',
      scaleBounds:    [0.05, 0.3],
      verticalJitter: 200,
      accelerate:     true,
      reversed:       true,
    },
  ],
};

const Terrain: Collection = {
  spawnRate:  [3000, 40000],
  scrollRate: [40000, 60000],
  assets: [
    { className: 'hills',     scaleBounds: [0.7, 1], flippable: true },
    { className: 'mountains', scaleBounds: [0.4, 1], flippable: true },
  ],
};

const Background: Collection = {
  spawnRate:  [5000,  10000],
  scrollRate: [25000, 35000],
  assets: [
    { className: 'pine-tree',    scaleBounds: [0.3, 0.5], flippable: true },
    { className: 'oak-tree',     scaleBounds: [0.4, 0.5], flippable: true },
    { className: 'cactus',       scaleBounds: [0.2, 0.3], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.2, 0.3], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.4, 0.6], flippable: true },
    { className: 'sign',         scaleBounds: [0.3, 0.5], flippable: true },
  ],
};

const Foreground: Collection = {
  spawnRate:  [1000,  13000],
  scrollRate: [18000, 27000],
  assets: [
    { className: 'pine-tree',    scaleBounds: [0.4, 0.6], flippable: true },
    { className: 'oak-tree',     scaleBounds: [0.4, 0.7], flippable: true },
    { className: 'cactus',       scaleBounds: [0.3, 0.4], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.3, 0.6], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.4, 0.5], flippable: true },
    { className: 'grass-patch',  scaleBounds: [0.3, 0.6], flippable: true },
    { className: 'sign',         scaleBounds: [0.6, 0.8], flippable: true },
    // { className: 'tumbleweed',   scaleBounds: [0.2, 0.3], flippable: true, spin: true, accelerate: true },
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
        timeout:  this.randomInteger(Sky.spawnRate),
        callback: () => this.insertElementFromCollection(Sky, this.skyLayers),
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

    if (document.visibilityState === 'visible') {
      this.intervals.forEach(interval => interval.start(true));
    }

    document.addEventListener('visibilitychange', () => {
      this.intervals.forEach(
        interval => document.visibilityState === 'visible' ? interval.start() : interval.stop(),
      );
    });

    this.scrollerRoot.addEventListener('animationend', (event: AnimationEvent) => {
      if (event.animationName === 'scroll-right-to-left' || event.animationName === 'scroll-left-to-right') {
        const target = event.target as HTMLElement;
        target.parentNode?.removeChild(target);
      }
    });
  }

  insertElementFromCollection(collection: Collection, layers: NodeListOf<HTMLElement>) {
    const layerIdx    = this.randomInteger(0, layers.length - 1);
    const asset       = this.randomElement(collection.assets);
    const element     = this.createElement(asset);
    const nextSpawnMs = this.randomInteger(collection.spawnRate);
    const scrollMs    = this.randomInteger(collection.scrollRate);

    let animationDuration = scrollMs - (layerIdx * scrollMs * 0.1);
    animationDuration = asset.accelerate ? animationDuration * this.randomNumber(0.2, 0.5) : animationDuration;

    let animation = asset.reversed ? 'scroll-left-to-right' : 'scroll-right-to-left';

    let animationString = `${animation} ${ animationDuration }ms linear`;

    if (asset.spin) {
      animationString += ', spin-counterclockwise 2s linear infinite';
      element.style.transformOrigin = 'center center';
    }

    element.style.animation = animationString;

    layers[layerIdx].appendChild(element);

    return nextSpawnMs;
  }

  createElement({ className, scaleBounds, flippable, verticalJitter, reversed }: Asset) {
    const el = document.createElement('div');
    el.classList.add('element', className);

    if (reversed) {
      el.classList.add('element-reversed');
    }

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
