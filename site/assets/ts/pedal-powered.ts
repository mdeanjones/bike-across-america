import Countdown from './lib/countdown';
import SideScroller from './lib/side-scroller';
import initializeMap from './lib/map';

(() => {
  new Countdown('2022-08-31T09:00:00-08:00', '#countdown');
  new SideScroller();

  window.initMap = initializeMap;
})();

// function easeOutQuint (t, b, c, d) {
//   return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
// }

const foo = '1';
