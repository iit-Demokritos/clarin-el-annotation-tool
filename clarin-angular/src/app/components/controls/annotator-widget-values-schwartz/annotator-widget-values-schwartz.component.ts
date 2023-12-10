import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '@components/controls/base-control/base-control.component';
import * as Highcharts from "highcharts";

@Component({
  selector: 'app-annotator-widget-values-schwartz',
  templateUrl: './annotator-widget-values-schwartz.component.html',
  styleUrls: ['./annotator-widget-values-schwartz.component.scss']
})
export class AnnotatorWidgetValuesSchwartzComponent extends BaseControlComponent implements OnInit {

  super() { };

  Highcharts: typeof Highcharts = Highcharts;

  colors = Highcharts.getOptions().colors;
  fontSizes = ['0.9em', '0.7em', '0.7em'];
  // Colors from: https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors
  moreNarrowlyDefinedValues = [];
  moreNarrowlyDefinedValueNames = [
    {name: /*'Self-Direction-*/'Thought',    color:'#FFCC80' /* Orange-200 */,      custom: {value: 'self_direction_thought',    tooltip: "<b>Self-Direction-Thought</b>: The freedom to cultivate one’s own ideas and abilities"}},
    {name: /*'Self-Direction-*/'Action',     color:'#FFB74D' /* Orange-300 */,      custom: {value: 'self_direction_action',     tooltip: "<b>Self-Direction-Action</b>: The freedom to determine one’s own actions"}},
    {name: 'Stimulation',                    color:'#FFA726' /* Orange-400 */,      custom: {value: 'stimulation',               tooltip: "<b>Stimulation</b>: Excitement, novelty, and challenge in life"}},
    {name: 'Hedonism',                       color:'#D4E157' /* Lime-400 */,        custom: {value: 'hedonism',                  tooltip: "<b>Hedonism</b>: Pleasure and sensuous gratification for oneself"}},
    {name: 'Achievement',                    color:'#66BB6A' /* Green-400 */,       custom: {value: 'achievement',               tooltip: "<b>Achievement</b>: Personal success through demonstrating competence according to social standards"}},
    {name: /*'Power-*/'Dominance',           color:'#80CBC4' /* Teal-200 */,        custom: {value: 'power_dominance',           tooltip: "<b>Power-Dominance</b>: Power through exercising control over people"}},
    {name: /*'Power-*/'Resources',           color:'#4DB6AC' /* Teal-300 */,        custom: {value: 'power_resources',           tooltip: "<b>Power-Resources</b>: Power through control of material and social resources"}},
    {name: 'Face',                           color:'#9FA8DA' /* Indigo-200 */,      custom: {value: 'face',                      tooltip: "<b>Face</b>: Security and power through maintaining one’s public image and avoiding humiliation"}},
    {name: /*'Security-*/'Personal',         color:'#F48FB1' /* Pink-200 */,        custom: {value: 'security_personal',         tooltip: "<b>Security-Personal</b>: Safety in one’s immediate environment"}},
    {name: /*'Security-*/'Societal',         color:'#F06292' /* Pink-300 */,        custom: {value: 'security_societal',         tooltip: "<b>Security-Societal</b>: Safety and stability in the wider society"}},
    {name: 'Tradition',                      color:'#90CAF9' /* Blue-200 */,        custom: {value: 'tradition',                 tooltip: "<b>Tradition</b>: Maintaining and preserving cultural, family, or religious traditions"}},
    {name: /*'Conformity-*/'Rules',          color:'#CE93D8' /* Purple-200 */,      custom: {value: 'conformity_rules',          tooltip: "<b>Conformity-Rules</b>: Compliance with rules, laws, and formal obligations"}},
    {name: /*'Conformity-*/'Interpersonal',  color:'#BA68C8' /* Purple-300 */,      custom: {value: 'conformity_interpersonal',  tooltip: "<b>Conformity-Interpersonal</b>: Avoidance of upsetting or harming other people"}},
    {name: 'Humility',                       color:'#FF8A65' /* Deep Orange-300 */, custom: {value: 'humility',                  tooltip: "<b>Humility</b>: Recognizing one’s insignificance in the larger scheme of things"}},
    {name: /*'Universalism-*/'Nature',       color:'#BCAAA4' /* Brown-200 */,       custom: {value: 'universalism_nature',       tooltip: "<b>Universalism-Nature</b>: Preservation of the natural environment"}},
    {name: /*'Universalism-*/'Concern',      color:'#A1887F' /* Brown-300 */,       custom: {value: 'universalism_concern',      tooltip: "<b>Universalism-Concern</b>: Commitment to equality, justice, and protection for all people"}},
    {name: /*'Universalism-*/'Tolerance',    color:'#8D6E63' /* Brown-400 */,       custom: {value: 'universalism_tolerance',    tooltip: "<b>Universalism-Tolerance</b>: Acceptance and understanding of those who are different from oneself"}},
    {name: /*'Benevolence-*/'Caring',        color:'#90A4AE' /* Blue Gray-300 */,   custom: {value: 'benevolence_caring',        tooltip: "<b>Benevolence-Caring</b>: Devotion to the welfare of in-group members"}},
    {name: /*'Benevolence-*/'Dependability', color:'#78909C' /* Blue Gray-400 */,   custom: {value: 'benevolence_dependability', tooltip: "<b>Benevolence-Dependability</b>: Being a reliable and trustworthy member of the in-group"}},
  ];
  // moreNarrowlyDefinedValueGroups = [
  //   {name: 'Self-Direction',    y: 100./19.*2, dataLabels: {y: 18, rotation: 18},         color: '#FFE0B2' /* Orange-100 */},
  //   {name: ''/*'Stimulation'*/, y: 100./19.*1, enabled: false, color: 'transparent'},
  //   {name: ''/*'Hedonism'*/,    y: 100./19.*1, color: 'transparent'},
  //   {name: ''/*'Achievement'*/, y: 100./19.*1, color: 'transparent'},
  //   {name: 'Power',             y: 100./19.*2, dataLabels: {x: 8, y: 20, rotation: 294},  color: '#B2DFDB' /* Teal-100 */},
  //   {name: ''/*'Face'*/,        y: 100./19.*1, color: 'transparent'},
  //   {name: 'Security',          y: 100./19.*2, dataLabels: {x: 6, y: 18, rotation: -10},  color: '#F8BBD0' /* Pink-100 */},
  //   {name: ''/*'Tradition'*/,   y: 100./19.*1, color: 'transparent'},
  //   {name: 'Conformity',        y: 100./19.*2, dataLabels: {x: -6, y: 28, rotation: 50}, color: '#E1BEE7' /* Purple-100 */},
  //   {name: ''/*'Humility'*/,    y: 100./19.*1, color: 'transparent'},
  //   {name: 'Universalism',      y: 100./19.*3, dataLabels: {x: 2, y: 26, rotation: -64},  color: '#D7CCC8' /* Brown-100 */},
  //   {name: 'Benevolence',       y: 100./19.*2, dataLabels: {y: 16, rotation: -20},        color: '#CFD8DC' /* Blue Gray-200 */},
  // ];
  moreNarrowlyDefinedValueGroups = [
    {name: 'Self-Direction',    y: 100./19.*2, dataLabels: {textPath: {attributes: {startOffset: '17'}}}, color: '#FFE0B2' /* Orange-100 */},
    {name: ''/*'Stimulation'*/, y: 100./19.*1, enabled: false, color: 'transparent'},
    {name: ''/*'Hedonism'*/,    y: 100./19.*1, color: 'transparent'},
    {name: ''/*'Achievement'*/, y: 100./19.*1, color: 'transparent'},
    {name: 'Power',             y: 100./19.*2, dataLabels: {textPath: {attributes: {startOffset: '37'}}}, color: '#B2DFDB' /* Teal-100 */},
    {name: ''/*'Face'*/,        y: 100./19.*1, color: 'transparent'},
    {name: 'Security',          y: 100./19.*2, dataLabels: {textPath: {attributes: {startOffset: '30'}}}, color: '#F8BBD0' /* Pink-100 */},
    {name: ''/*'Tradition'*/,   y: 100./19.*1, color: 'transparent'},
    {name: 'Conformity',        y: 100./19.*2, dataLabels: {textPath: {attributes: {startOffset: '26'}}}, color: '#E1BEE7' /* Purple-100 */},
    {name: ''/*'Humility'*/,    y: 100./19.*1, color: 'transparent'},
    {name: 'Universalism',      y: 100./19.*3, dataLabels: {textPath: {attributes: {startOffset: '45'}}}, color: '#D7CCC8' /* Brown-100 */},
    {name: 'Benevolence',       y: 100./19.*2, dataLabels: {textPath: {attributes: {startOffset: '19'}}}, color: '#CFD8DC' /* Blue Gray-200 */},
  ];
  // higherOrderValues = [
  //   {name: 'Openness to change', y: 18.5, dataLabels: {y: 34, rotation: 34},          color: '#FFF3E0' /* Orange-50 */},
  //   {name: 'Self-Enhancement',   y: 21,   dataLabels: {x: 10, y: 56, rotation: 286},  color: '#E0F2F1' /* Teal-50   */},
  //   {name: 'Conservation',       y: 31.5, dataLabels: {y: 26, rotation: 18},          color: '#FCE4EC' /* Pink-50   */},
  //   {name: 'Self-Transcentance', y: 29,   dataLabels: {x: 10, y: 26, rotation: 310},  color: '#EFEBE9' /* Brown-50  */},
  // ];
  higherOrderValues = [
    {name: 'Openness to change', y: 18.5, dataLabels: {textPath: {attributes: {startOffset: '25%', textAnchor: 'middle'}}}, color: '#FFF3E0' /* Orange-50 */},
    {name: 'Self-Enhancement',   y: 21,   dataLabels: {textPath: {attributes: {startOffset: '20%', textAnchor: 'middle'}}}, color: '#E0F2F1' /* Teal-50   */},
    {name: 'Conservation',       y: 31.5, dataLabels: {textPath: {attributes: {startOffset: '25%', textAnchor: 'middle'}}}, color: '#FCE4EC' /* Pink-50   */},
    {name: 'Self-Transcentance', y: 29,   dataLabels: {textPath: {attributes: {startOffset: '25%', textAnchor: 'middle'}}}, color: '#EFEBE9' /* Brown-50  */},
  ];

  ngOnInit(): void {
    /*
     * Works best when the widget is large...
    // Correction offsets to fix label positions.
    this.fontSizes = ['1.25em', '1em', '1em'];
    //        1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
    var x = [10, 16, 12, 18,  0,  8,  6,  8, -1,  6,  0, -6,  0,-12,-22,-16,-16,-14, -6];
    var y = [28, 12, 40, 28, 22, 32, 48, 46, 58, 52, 60, 46, 50, 28, 18, 26, 30, 18, 60];
     */

    // Correction offsets to fix label positions.
    this.fontSizes = ['0.9em', '0.7em', '0.7em'];
    //        1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
    var x = [ 6, 10, 12, 18, 12,  6,  4,  4, -4,  6,  0, -6,  0,-12,-20,-16,-10,-10, -2];
    var y = [18, 12, 26, 20, 14, 24, 34, 28, 34, 32, 50, 38, 36, 20, 14, 20, 22, 14, 50];

    var items = this.moreNarrowlyDefinedValueNames.length;
    // items = 19;
    var Y = 100. / items ;
    var angle = -90;
    var step = 360. / items;
    var rotation;
    this.moreNarrowlyDefinedValueNames.forEach((item, index) => {
      rotation = angle + step / 2.;
      angle += step;
      //name = '--------------| '+(index+1);
      if (angle > 90) {
        rotation += 180;
        //name = (index+1) + ' |--------------';
      }
      // if (this.moreNarrowlyDefinedValues.length < items) {
      // console.error(angle, rotation, index);
      this.moreNarrowlyDefinedValues.push({
        name: item.name,
        y: Y,
        color: item.color, //this.colors[index],
        dataLabels: {x: x[index], y: y[index], rotation: rotation},
        custom: item.custom,
        //color: this.data[i].color
      });
      // }
    });

    // Build the data arrays
    /*
    for (i = 0; i < this.dataLen; i += 1) {
    
        // add version data
        drillDataLen = this.data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            let name = this.data[i].drilldown.categories[j];
            brightness = 0.2 - (j / drillDataLen) / 5;
            this.moreNarrowlyDefinedValueGroups.push({
                name,
                y: this.data[i].drilldown.data[j],
                color: Highcharts.color(this.data[i].color).brighten(brightness).get(),
                custom: {
                    version: name.split(' ')[1] || name.split(' ')[0]
                }
            });
        }
    }*/
   //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedValue.bind(this));
  }; /* ngOnInit */

  chartInstancePie: Highcharts.Chart;
  chartOptionsPie: Highcharts.Options = {
    chart: {
      type: 'pie',
      margin: 0,
    },
    /*
    title: {
      text: 'Schwartz Refined Theory of Values',
      align: 'left'
    },
   */
    title: null,
    subtitle: null,
    exporting: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      pie: {
        shadow: false,
        center: ['50%', '50%'],
        //slicedOffset: 20,
        slicedOffset: 10,
        size: '100%',
        dataLabels: {
          enabled: true,
        },
      },
      // series: {
      //   events: {
      //     click: this.onClick.bind(this),
      //   },
      // },
    },
    tooltip: {
      pointFormat: '{point.custom.tooltip}'
    },
    // tooltip: {
    //   //valueSuffix: '%'
    // },
    series: [{
      type: null,
      name: '19 Narrowly Defined Values',
      data: this.moreNarrowlyDefinedValues,
      size: '100%',
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.5)',
      dataLabels: {
        color: '#ffffff',
        distance: '-50%',
        style: {
          fontWeight: 'normal',
          fontSize: this.fontSizes[0],
          textShadow: false,
          textOutline: 'none',
        }
      },
      allowPointSelect: true,
      point: {
        events: {
          select:   this.onSelectValue.bind(this),
          unselect: this.onUnselectValue.bind(this),
        }
      },
      tooltip: {
        pointFormat: '{point.custom.tooltip}'
      },
    }, {
      type: null,
      name: '19 Narrowly Defined Value Groups',
      data: this.moreNarrowlyDefinedValueGroups,
      size: '90%',
      innerSize: '87%',
      borderWidth: 0,
      // borderColor: 'rgba(0,0,0,0.5)',
      dataLabels: {
        inside: true,
        shadow: false,
        color: 'rgba(0,0,0,0.8)',
        distance: '-10%',
        position: 'center',
        verticalAlign: 'top',
        style: {
          fontWeight: 'normal',
          fontSize: this.fontSizes[1],
          textShadow: false,
          textOutline: 'none',
        },
        textPath: {
          enabled: true,
          attributes: {
            startOffset: '10',
            textAnchor: 'start',
            dy: 14,
          }
        }
      }
    }, {
      type: null,
      name: 'Higher Order Values',
      data: this.higherOrderValues,
      size: '100%',
      innerSize: '90%',
      borderWidth: 0,
      dataLabels: {
        inside: true,
        shadow: false,
        color: 'rgba(0,0,0,0.8)',
        //distance: '-10%',
        position: 'center',
        align: 'center',
        verticalAlign: 'top',
        width: 30,
        style: {
          fontWeight: 'normal',
          fontSize: this.fontSizes[2],
          textShadow: false,
          textOutline: 'none',
          textOverflow: 'ellipsis',
        },
        textPath: {
          enabled: true,
          attributes: {
            startOffset: '10',
            textAnchor: 'start',
            //textLength: '40em',
            dy: 14,
          }
        },
      }
    }
  /*, {
      type: null,
      name: '19 Narrowly Defined Value Groups',
      data: this.moreNarrowlyDefinedValueGroups,
      size: '100%',
      innerSize: '80%',
      dataLabels: {
        format: '<b>{point.name}:</b> <span style="opacity: 0.5">{y}%</span>',
        filter: {
          property: 'y',
          operator: '>',
          value: 1
        },
        style: {
          fontWeight: 'normal'
        }
      },
      id: 'versions'
    }*/],
    /*responsive: {
      rules: [{
        condition: {
          maxWidth: 400
        },
        chartOptions: {
          series: [{
            type: null,
          }, {
            type: null,
            id: 'versions',
            dataLabels: {
              //distance: 10,
              format: '{point.custom.version}',
              filter: {
                property: 'percentage',
                operator: '>',
                value: 2
              }
            }
          }]
        }
      }]
    }*/
  };

  selectedSlice: any;
  selectedSliceIndex: number;


  setChartInstancePie(chart: Highcharts.Chart) {
    this.chartInstancePie = chart;
  }

  onClick(event) {
    console.error("AnnotatorWidgetValuesSchwartzComponent(): onClick()", event);
  }; /* onClick */

  onSelectValue(event) {
    // console.error("AnnotatorWidgetValuesSchwartzComponent(): onSelectValue()", event);
    this.selectedSlice       = event.target;
    this.selectedSliceIndex  = event.target.index;
    var value = this.selectedSlice.custom.value;
    this.addOrUpdateAnnotation(this.annotationType, this.annotationAttribute, value);
  }; /* onSelectValue */

  onUnselectValue(event) {
    // console.error("AnnotatorWidgetValuesSchwartzComponent(): onUnselectValue()", event);
  }; /* onUnselect */

  updateSelectedValue() {
    var selectedAnnotationAttribute = this.getSelectedAnnotationAttribute();
      if (selectedAnnotationAttribute === undefined) {
        // Unselect everything...
        this.unselectAll();
        return;
      }
      // Select the proper slice...
      var index = this.moreNarrowlyDefinedValues.findIndex(value =>
        value.custom.value == selectedAnnotationAttribute.value
      );
      if (index != -1) {
        this.chartInstancePie.series[0].data[index].select(true);
      }
  }; /* updateSelectedValue */

  unselectAll() {
    this.chartInstancePie.series[0].data.forEach(point => {
      if (point.selected) {point.select(false);}
    });
  }; /* unselectAll */
}
