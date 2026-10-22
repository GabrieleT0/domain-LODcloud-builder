import React from "react";
import Chart from "react-apexcharts";

const RadarChart = ({ title, categories, seriesData, height = 350 }) => {
    const options = {
        chart: {
          type: "radar",
          width: '100%'
        },
        title: {
          text: title,
          align: 'center'
        },
        xaxis: {
          categories,
          labels: {
            formatter: function (value) {
              return value.split(' ')[0]; // cut at first space
            }
          }
        },
        yaxis:{
            min: 0,
            max: 1,
            tickAmount: 4,
            labels: {
              formatter: function(val) {
                return val.toFixed(2);
              }
            }
        },
        plotOptions: {
          radar: {
            polygons: {
              strokeColors: '#e8e8e8',
              strokeWidth: 1,
              connectorColors: '#e8e8e8',
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center',
          markers: {
            width: 12,
            height: 12,
          }
        },
        stroke: {
          width: 2,
        },
        fill: {
          opacity: 0.2,
        },
        markers: {
          size: 4,
        },
        tooltip: {
          x: {
            formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
              return categories[dataPointIndex]; // show full label in tooltip
            }
          }
        },
      };

    const series = seriesData;
    return (
        <Chart options={options} series={series} type="radar" height={height} />
    )
}
export default RadarChart;