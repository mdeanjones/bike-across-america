export type IntervalOptions = {
  callback: () => void;
  timeout:  number;
  repeat?:  number;
}

/**
 * A fancier implementation of `setInterval` with support for pausing the interval
 * and then resuming it.
 */
export default class Interval {
  protected options:      Required<IntervalOptions>;
  protected repeatCount?: number;
  protected lastEnqueue?: number;
  protected stoppedOn?:   number;
  protected timerId?:     number;

  constructor(options: IntervalOptions) {
    this.options     = { repeat: Number.POSITIVE_INFINITY, ...options };
    this.repeatCount = 0;
  }

  public start(immediate?: boolean) {
    if (this.options.repeat < 1) {
      throw new Error();
    }

    if (immediate) {
      this.tick();
    }
    else {
      const timeout = this.stoppedOn && this.lastEnqueue
        ? this.options.timeout + this.lastEnqueue - this.stoppedOn
        : this.options.timeout;

      this.queueNext(timeout);
    }

    this.stoppedOn = undefined;
  }

  public stop() {
    clearTimeout(this.timerId);

    this.timerId   = undefined;
    this.stoppedOn = Date.now();
  }

  public reset() {
    this.stop();

    this.repeatCount = 0;
    this.lastEnqueue = undefined;
    this.stoppedOn   = undefined;
    this.timerId     = undefined;
  }

  protected tick() {
    this.repeatCount += 1;
    this.options.callback();

    if (this.repeatCount < this.options.repeat) {
      // Corrects for `setTimeout` not actually guaranteeing millisecond accuracy.
      // Over time, the average timeout will trend towards what was configured.
      const timeout = this.lastEnqueue
        ? (this.options.timeout * 2) + this.lastEnqueue - Date.now()
        : this.options.timeout;

      this.queueNext(timeout);
    }
  }

  protected queueNext(timeout: number) {
    this.lastEnqueue = Date.now();
    this.timerId     = setTimeout(() => this.tick(), timeout);
  }
}
