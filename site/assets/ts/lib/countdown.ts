import Interval from "./interval";

export default class Countdown {
  protected toUnix:   number;
  protected outlet:   HTMLElement;
  protected days:     HTMLElement;
  protected hours:    HTMLElement;
  protected minutes:  HTMLElement;
  protected seconds:  HTMLElement;
  protected interval: Interval;

  constructor(to: string, outlet: string) {
    this.toUnix  = new Date(to).getTime();
    this.outlet  = document.querySelector(outlet) as HTMLElement;
    this.days    = this.makeCounter('days');
    this.hours   = this.makeCounter('hours');
    this.minutes = this.makeCounter('minutes');
    this.seconds = this.makeCounter('seconds');

    this.interval = new Interval({
      timeout:  1000,
      callback: () => this.tick(),
    });

    this.interval.start(true);
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

  makeCounter(unit: string) {
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

  update(element: HTMLElement, value: string) {
    if (element.innerHTML !== value) {
      element.innerHTML = value;
    }
  }
}
