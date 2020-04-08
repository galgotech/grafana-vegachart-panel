import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import _ from 'lodash';
//import kbn from 'grafana/app/core/utils/kbn';
// @ts-ignore
//import TimeSeries from 'grafana/app/core/time_series';
//import rendering from './rendering';
//import './legend';

import * as vega from  './lib/vega';


class VegaChartCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';
  $rootScope: any;
  rawData: any;
  data: any;

  /** @ngInject */
  constructor($scope: any, $injector: any, $rootScope: any) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    
    const panelDefaults = {
      data_format: "function (data) {\n  return data;\n}",
      data: JSON.stringify({
          $schema: 'https://vega.github.io/schema/vega/v5.json',
          width: 400,
          height: 200,
          padding: 5,
          signals: [],
          scales: [],
          axes: [],
          marks: []
      }, null, 4)
    };

    _.defaults(this.panel, panelDefaults);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

    this.setLegendWidthForLegacyBrowser();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-vegachart-panel/editor.html', 2);
    //this.unitFormats = kbn.getUnitFormats();
  }

  onDataError() {
    this.data = [];
    this.render();
  }

  onRender() {
    if (this.panel.data == '') {
      return 
    }
    try {
      var spec = JSON.parse(this.panel.data);

      
      this.parseRawData(this.rawData)
      
      spec.data = this.parseRawData([
        {
          name: 'table',
          values: [
            { category: 'A', amount: 28 },
            { category: 'B', amount: 55 },
            { category: 'C', amount: 43 },
            { category: 'D', amount: 91 },
            { category: 'E', amount: 81 },
            { category: 'F', amount: 53 },
            { category: 'G', amount: 19 },
            { category: 'H', amount: 87 },
          ],
        },
      ]);
      
      var view = new vega.View(vega.parse(spec), {
          renderer: 'svg', // renderer (canvas or svg)
          container: '.vegachart-panel__chart', // parent DOM container
          hover: true, // enable hover processing
      });
      return view.runAsync();
    } catch (e) {
      console.log("JSON error", e)
    }
  }

  parseRawData(rawData: any) {
    var func = eval("(function () { return " + this.panel.data_format + "})()") ;
    return func(rawData);
  }

  onDataReceived(dataList: any) {
    this.rawData = dataList;
    //  this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseRawData(this.rawData);
    this.render(this.data);
  }

  seriesHandler(seriesData: any) {
    //    const series = new TimeSeries({
    //      datapoints: seriesData.datapoints,
    //      alias: seriesData.target,
    //    });
    //    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    //    return series;
  }

  setLegendWidthForLegacyBrowser() {
    // @ts-ignore
    const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if (isIE11 && this.panel.legendType === 'Right side' && !this.panel.legend.sideWidth) {
      this.panel.legend.sideWidth = 150;
    }
  }
}

export { VegaChartCtrl, VegaChartCtrl as MetricsPanelCtrl };
