import { AfterViewInit, Component, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { MainComponent } from '../main/main.component';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import * as Highcharts from "highcharts";

@Component({
  selector: 'analytics-annotation-values',
  templateUrl: './analytics-annotation-values.component.html',
  styleUrls: ['./analytics-annotation-values.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsAnnotationValuesComponent extends MainComponent implements OnInit, AfterViewInit {

  @Input() showPageHeader: boolean = true;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() showAnnotatorSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = true;
  @Input() allowMultipleDocuments: boolean = true;

  selectedCollections   = [];
  selectedDocuments     = [];
  selectedDocumentIds   = [];
  annotators            = [];
  selectedAnnotators    = [];
  selectedAnnotatorsIds = [];
  schemaValues          = {};
  data                  = [];

  displayedColumns: string[] = ['group', 'label', 'count', 'value'];
  dataSource = new MatTableDataSource(this.data);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  match = {
    document_id:          { $in: this.selectedDocumentIds },
    type:                 { $nin: ["setting annotation"] },
    document_setting:     { $exists: false },
    collection_setting:   { $exists: false },
    document_attribute:   { $exists: false },
    collection_attribute: { $exists: false }
  };

  Highcharts: typeof Highcharts = Highcharts;

  chartInstanceBar: Highcharts.Chart;
  chartOptionsBar: Highcharts.Options = {
    //chart: { type: 'column' },
    title: { text: null },
    xAxis: {
      categories: [],
      title: { text: 'Annotation Values' }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count',
        //align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true
        }
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    series: [
      {
        type: 'column',
        name: 'Count',
        colorByPoint: true,
        showInLegend: false,
        data: []
      }
    ]
  };

  chartInstancePie: Highcharts.Chart;
  chartOptionsPie: Highcharts.Options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: { text: null },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
      point: { valueSuffix: '%' }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      type: undefined,
      name: 'Percentage',
      colorByPoint: true,
      data: []
    }]
  };

  super() { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  setChartInstanceBar(chart: Highcharts.Chart) {
    this.chartInstanceBar = chart;
  }

  setChartInstancePie(chart: Highcharts.Chart) {
    this.chartInstancePie = chart;
  }

  onCollectionsChange(event) {
    this.selectedCollections = event;
    this.selectedDocuments   = [];
    this.selectedDocumentIds = [];
  }

  onDocumentsChange(event) {
    this.selectedDocuments     = event;
    this.selectedDocumentIds   = this.selectedDocuments.map(obj => obj.id);
    this.match.document_id.$in = this.selectedDocumentIds;
    this.getAnnotatorSchemas();
  }

  onAnnotatorsChange(event) {
    this.selectedAnnotators = event;
    this.selectedAnnotatorsIds = this.selectedAnnotators.map(obj => obj['_id'])
    if (this.selectedAnnotatorsIds.length) {
      this.match['annotator_id'] = { $in: this.selectedAnnotatorsIds };
    } else {
      delete this.match['annotator_id'];
    }
    this.getAnnotatorSchemaValues();
  }

  getAnnotatorSchemas() {
    if (!this.selectedDocumentIds.length) {
      this.annotators = [];
      return;
    }
    var group = {
      _id:  "$annotator_id",
      count: {$sum : 1}
    };
    this.analyticsService.aggregate([
      { $match:   this.match },
      { $group:   group },
      { $sort : { count : -1, _id: 1 } }
    ])
    .then((response) => {
      if (response["success"]) {
        this.annotators = response['data'].map((obj) => {
          obj['name'] = obj['_id'];
          return obj;
        });
      } else {
        this.annotators= [];
      }
    }, (error) => {
      this.annotators = [];
    });
  }

  getAnnotatorSchemaValues() {
    this.schemaValues = {};
    for (var id of this.selectedAnnotatorsIds) {
      var schema = this.TextWidgetAPI.getAnnotationSchemaFromAnnotatorTypeId(id);
      var type   = this.TextWidgetAPI.getAnnotatorTypeFromAnnotatorTypeId(id);
      if (type == "Button Annotator") {
        this.buttonAnnotatorService.getValues(schema.language,
          schema.annotation_type, schema.attribute, schema.alternative)
        .then((response) => {
           for (var g of response['groups']) {
             var values = g['values'];
             var labels = g['labels'];
             var descrs = g['descriptions'];
             for (var i = 0; i < values.length; i++) {
               this.schemaValues[values[i]] = {
                 group: g['group'],
                 label: ((labels[i]) ? labels[i] : descrs[i])
               }
             }
           }
        });
      } else if (type == "Coreference Annotator") {
        this.coreferenceAnnotatorService.getValues(schema.language,
          schema.annotation_type, schema.alternative);
      }
    }
  }

  onApply(event) {
    var group = {
      _id:  "$attributes.value",
      count: {$sum : 1}
    };
    this.analyticsService.aggregate([
      { $match:   this.match },
      { $unwind: "$attributes" },
      { $group:   group },
      { $sort : { count : -1, _id: 1 } }
    ]).then((response) => {
      if (response["success"]) {
        this.data = [];
        for (var value of response['data']) {
          var id = value['_id'];
          this.data.push({
            value: id,
            count: value['count'],
            label: (id in this.schemaValues) ? this.schemaValues[id]['label'] : id,
            group: (id in this.schemaValues) ? this.schemaValues[id]['group'] : "Found in Collection"
          });
        }
        this.dataSource.data = this.data;
        this.table.renderRows();
        this.updateCharts();
      }
    });
  }

  updateCharts() {
    this.chartInstanceBar.xAxis[0].setCategories(this.data.map(o => o.label));
    this.chartInstanceBar.series[0].setData(this.data.map(o => o.count));
    this.chartInstancePie.series[0].setData(this.data.map((o) => {
      return {name: o.label, y: o.count};
    }));
  }

  onChartUpdate(event) {
    var options;
    switch(event) {
      case 'inverted':
        options = { chart: { inverted: true, polar: false } };
        break;
      case 'plain':
        options = { chart: { inverted: false, polar: false } };
        break;
      case 'polar':
        options = { chart: { inverted: false, polar: true } };
        break;
    }
    this.chartInstanceBar.update(options);
  }

  onTabChange(event) {
    switch(event['index']) {
      case 1:
        this.chartInstanceBar.reflow();
        break;
      case 2:
        this.chartInstancePie.reflow();
        break;
    }
  }

}
