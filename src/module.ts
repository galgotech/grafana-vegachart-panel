import { VegaChartCtrl } from './vegachart_ctrl';
import { loadPluginCss } from 'grafana/app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/grafana-vegachart-panel/styles/dark.css',
  light: 'plugins/grafana-vegachart-panel/styles/light.css',
});

export { VegaChartCtrl as PanelCtrl };
