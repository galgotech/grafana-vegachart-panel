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
      data: "function () {\n\t" + JSON.stringify({
          $schema: 'https://vega.github.io/schema/vega/v5.json',
          width: 400,
          height: 200,
          padding: 5,
          signals: [],
          scales: [],
          axes: [],
          marks: []
      }, null, 4) + "return data;\n}"
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
      let spec = eval("(function () { return " + this.panel.data + "})()")();
      spec.data = this.parseRawData(this.rawData);
      
      let view = new vega.View(vega.parse(spec), {
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
    if (this.rawData.length == 0) {
        return [];
    }

    let cols = rawData[0].columns;
    let rows = rawData[0].rows;
    let data: any = [];
    for (let i in rows ) {
        let row = rows[i];
        let d: any = {};
        for (let j in cols) {
          d[ cols[j].text ] = row[j];
        }
        data.push(d);
    }
  
    var func = eval("(function () { return " + this.panel.data_format + "})()") ;
    return func(data);
  }

  onDataReceived(dataList: any) {
    this.rawData = dataList;
    //  this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseRawData(this.rawData);
    this.render(this.data);
  }
  
  link(scope: any, elem: any, attrs: any, ctrl: any) {
        console.log("link");
        //rendering(scope, elem, attrs, ctrl);
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
