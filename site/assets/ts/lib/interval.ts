export type IntervalCallback = (...args: unknown[]) => unknown;

export type IntervalOptions = {
  callback: IntervalCallback;
}

export default class Interval {
  protected callback: IntervalCallback;

  constructor(options: IntervalOptions) {
    this.callback = options.callback;
  }

  public start() {

  }

  public stop() {

  }

  public reset() {

  }

  protected tick() {

  }
}
