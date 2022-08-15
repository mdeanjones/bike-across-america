import Countdown from './lib/countdown';
import SideScroller from './lib/side-scroller';
import setupMaps from './lib/map';

new Countdown('2022-08-31T09:00:00-08:00', '#countdown');
new SideScroller();

setupMaps();
