export type IntervalOptions = {
  callback: () => void;
  timeout:  number;
  repeat?:  number;
}

/**
 * A fancier implementation of `setInterval` with support for
 * pausing/resuming.
 */
export default class Interval {
  constructor(options: IntervalOptions) {
    this.options = { repeat: Number.POSITIVE_INFINITY, ...options };
  }

  protected options: Required<IntervalOptions>;

  /**
   * The number of calls to `tick` that have occurred since the Interval
   * was started.
   */
  protected repeatCount = 0;

  /**
   * The UNIX timestamp captured when `queueNext` is called.
   */
  protected lastEnqueue?: number;

  /**
   * The UNIX timestamp captured when `stop` is called.
   */
  protected stoppedOn?: number;

  /**
   * The ID of the `setTimeout` timer generated by calling `queueNext`.
   */
  protected timerId?: number;

  public start(immediate?: boolean) {
    if (this.options.repeat < 1) {
      throw new Error();
    }

    if (immediate) {
      this.tick();
    }
    else {
      let timeout = this.options.timeout;

      if (this.stoppedOn && this.lastEnqueue) {
        // Should always be a negative number
        const expendedInterval = this.lastEnqueue - this.stoppedOn;
        timeout = this.options.timeout + expendedInterval;
      }

      this.stoppedOn = undefined;
      this.queueNext(timeout);
    }
  }

  public stop() {
    clearTimeout(this.timerId);

    this.timerId   = undefined;
    this.stoppedOn = Date.now();
  }

  public reset() {
    this.repeatCount = 0;
    this.lastEnqueue = undefined;
    this.stoppedOn   = undefined;
    this.timerId     = undefined;
  }

  protected tick() {
    this.repeatCount += 1;
    this.options.callback();

    if (this.repeatCount < this.options.repeat) {
      this.queueNext();
    }
  }

  protected queueNext(timeout?: number) {
    this.lastEnqueue = Date.now();
    this.timerId     = setTimeout(() => this.tick(), timeout ?? this.options.timeout);
  }
}
