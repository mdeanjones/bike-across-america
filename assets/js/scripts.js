class Countdown {
  constructor(to, outlet) {
    this.toUnix = new Date(to).getTime();
    this.outlet = outlet;
  }

  start() {
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.tick();
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  tick() {
    let seconds = Math.floor((this.toUnix - Date.now()) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours   = Math.floor(minutes / 60);
    let days    = Math.floor(hours / 24);

    seconds = Math.floor(seconds % 60);
    minutes = Math.floor(minutes % 60);
    hours   = Math.floor(hours % 24);

    document.querySelector(this.outlet).innerHTML =
        this.makeElement(days, 'days', false)
      + this.makeElement(hours, 'hours', true)
      + this.makeElement(minutes, 'minutes', true)
      + this.makeElement(seconds, 'seconds', true);
  }

  makeElement(value, unit, prependZero) {
    const fixedValue = prependZero && value < 10 ? `0${ value }` : `${ value }`;

    return `<div class="${ unit }">
      <div class="value display-3">${ fixedValue }</div>
      <div class="unit">${ unit }</div>
    </div>`
  }
}
