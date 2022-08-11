class Countdown {
  constructor(to, outlet) {
    this.toUnix     = new Date(to).getTime();
    this.outlet     = document.querySelector(outlet);
    this.days       = this.makeCounter('days');
    this.hours      = this.makeCounter('hours');
    this.minutes    = this.makeCounter('minutes');
    this.seconds    = this.makeCounter('seconds');

    setInterval(() => this.tick(), 1000);
    this.tick();
  }

  tick() {
    const seconds = Math.floor((this.toUnix - Date.now()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);

    this.update(this.seconds, Math.floor(seconds % 60).toString());
    this.update(this.minutes, Math.floor(minutes % 60).toString());
    this.update(this.hours, Math.floor(hours % 24).toString());
    this.update(this.days, days.toString());
  }

  makeCounter(unit) {
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add(unit);

    const valueEl = document.createElement('div');
    valueEl.classList.add('value');

    const unitEl = document.createElement('div');
    unitEl.classList.add('unit');
    unitEl.innerHTML = unit;

    wrapperEl.append(valueEl, unitEl);
    this.outlet.append(wrapperEl);

    return valueEl;
  }

  update(element, value) {
    if (element.innerHTML !== value) {
      element.innerHTML = value;
    }
  }
}

class SideScroller {
  static clouds = [
    { className: 'cloud', scaleBounds: [0.05, 0.3], flippable: true, verticalJitter: 200 },
  ];

  static terrain = [
    { className: 'hills',     scaleBounds: [0.2, 0.5],  flippable: true },
    { className: 'mountains', scaleBounds: [0.3, 0.65], flippable: true },
  ];

  static background = [
    { className: 'pine-tree',    scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'oak-tree',     scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'cactus',       scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.2, 0.5], flippable: true },
  ];

  static foreground = [
    { className: 'cactus',       scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tall-shrub',   scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'chubby-shrub', scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'grass-patch',  scaleBounds: [0.2, 0.5], flippable: true },
    { className: 'tumbleweed',   scaleBounds: [0.2, 0.4], flippable: true, spin: true, accelerate: true },
  ];

  constructor() {
    this.scrollerRoot     = document.getElementById('side-scroller');
    this.skyLayers        = this.scrollerRoot.querySelectorAll('.sky-layer .scroller');
    this.terrainLayers    = this.scrollerRoot.querySelectorAll('.terrain-layer .scroller');
    this.backgroundLayers = this.scrollerRoot.querySelectorAll('.ground-layer.background-layer .scroller');
    this.foregroundLayers = this.scrollerRoot.querySelectorAll('.ground-layer.foreground-layer .scroller');

    this.scrollerRoot.addEventListener('animationend', (event) => {
      event.target.parentNode.removeChild(event.target);
    });

    this.insertElementFromCollection(SideScroller.clouds,     this.skyLayers,        [3000, 9000],   [30000, 33000]);
    this.insertElementFromCollection(SideScroller.terrain,    this.terrainLayers,    [15000, 30000], [40000, 60000]);
    this.insertElementFromCollection(SideScroller.background, this.backgroundLayers, [10000, 15000], [25000, 35000]);
    this.insertElementFromCollection(SideScroller.foreground, this.foregroundLayers, [80000, 13000], [18000, 27000]);
  }

  insertElementFromCollection(collection, layerGroup, spawnRate, scrollRate) {
    const layerIdx       = this.randomInteger(0, layerGroup.length - 1);
    const element        = this.createRandomElement(collection);
    const nextSpawnMs    = this.randomInteger(spawnRate[0], spawnRate[1]);
    const scrollMs       = this.randomInteger(scrollRate[0], scrollRate[1]);



    element.style.animationDuration = `${ scrollMs - (layerIdx * scrollMs * 0.1) }ms`;

    layerGroup[layerIdx].appendChild(element);

    setTimeout(
      () => this.insertElementFromCollection(collection, layerGroup, spawnRate, scrollRate),
      nextSpawnMs,
    );
  }

  createRandomElement(array) {
    return this.createElement(this.randomElement(array));
  }

  createElement({ className, scaleBounds, flippable, verticalJitter }) {
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

  randomElement(array) {
    return array[this.randomInteger(0, array.length - 1)];
  }

  randomInteger(min, max) {
    return Math.floor(this.randomNumber(Math.ceil(min), Math.floor(max) + 1));
  }

  randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
}
