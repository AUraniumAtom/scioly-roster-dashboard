/**
 * Interactive charting module powered by ApexCharts.
 * Replaces static hand-rolled SVG charts with animated, interactive, responsive visualizations.
 */

import ApexCharts from 'apexcharts';

const chartCache = new Map();

/**
 * Renders an interactive bar/column chart using ApexCharts into the target container.
 *
 * @param {HTMLElement} container - Target DOM element.
 * @param {string[]} labels - Category names for X-axis.
 * @param {number[]} values - Numeric values for Y-axis.
 * @param {string[]} colors - Colors per bar.
 * @param {string} yAxisLabel - Label for the Y-axis.
 */
export function renderBarChart(container, labels, values, colors, yAxisLabel) {
  if (!container) return null;

  const key = container.id || container;
  if (chartCache.has(key)) {
    try {
      chartCache.get(key).destroy();
    } catch (e) {
      // Ignore cleanup error if DOM was modified externally
    }
    chartCache.delete(key);
  }
  container.innerHTML = '';

  const isDistributed = Array.isArray(colors) && colors.length > 1;
  const isLargeSet = labels.length > 12;
  const height = isLargeSet ? 320 : 250;

  const formattedValues = values.map((v) =>
    Number(Number(v).toFixed(v % 1 ? 1 : 0))
  );

  const options = {
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 350,
        animateGradually: { enabled: true, delay: 100 },
      },
      fontFamily: 'Segoe UI, Arial, sans-serif',
    },
    series: [
      {
        name: yAxisLabel,
        data: formattedValues,
      },
    ],
    xaxis: {
      categories: labels,
      labels: {
        rotate: labels.length > 6 ? -45 : 0,
        rotateAlways: labels.length > 6,
        style: { fontSize: '11px', colors: '#607080' },
        trim: true,
        maxHeight: 90,
      },
    },
    yaxis: {
      title: {
        text: yAxisLabel,
        style: { fontSize: '12px', fontWeight: 600, color: '#607080' },
      },
      labels: {
        style: { fontSize: '11px', colors: '#607080' },
      },
    },
    colors: Array.isArray(colors) && colors.length ? colors : ['#2574b8'],
    plotOptions: {
      bar: {
        distributed: isDistributed,
        borderRadius: 4,
        columnWidth: isLargeSet ? '85%' : '60%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: values.length <= 15,
      offsetY: -18,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#243746'],
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val}`,
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3,
    },
    legend: {
      show: false,
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
  chartCache.set(key, chart);
  return chart;
}

// Backwards-compatible export alias for any callers expecting renderSvgBarChart
export const renderSvgBarChart = renderBarChart;

/**
 * Renders an Index Score distribution histogram (bins 0-9, 10-19, ..., 100+).
 *
 * @param {HTMLElement} container - DOM element to render histogram into.
 * @param {number[]} values - Array of index values.
 */
export function renderHistogram(container, values) {
  const bins = Array(11).fill(0);
  values.forEach((val) => bins[Math.min(10, Math.floor(val / 10))]++);
  const labels = bins.map((_, idx) => `${idx * 10}-${idx * 10 + 9}`);
  const colors = bins.map(() => '#119d8b');
  return renderBarChart(container, labels, bins, colors, 'Candidates');
}
