<script>
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import * as d3 from "d3";
  import { fade } from "svelte/transition";
  import { globalSettings, chartSpecificSettings, dataSource } from "./stores";
  import { secondsToHM, abbreviateNumber } from "./utilities";

  import Timeline from "./Timeline.svelte";
  import Axis from "./Axis.svelte";
  import SparkboxLegend from "./SparkboxLegend.svelte";

  export let data;

  // Store selected time slice
  let activeIndex;
  
  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;

  let selectedLayers =
    $chartSpecificSettings.confidenceBandLineChart.layers.default;

  let xScaleMode =
    $chartSpecificSettings.confidenceBandLineChart.xScaleMode.default;

  let nBins = $chartSpecificSettings.confidenceBandLineChart.bins.default;

  let colourScheme =
    $chartSpecificSettings.confidenceBandLineChart.colourScheme.default;

  // get selected layers from store and save in local var
  $: selectedLayers = $chartSpecificSettings.confidenceBandLineChart.layers.selectedValue;
  $: xScaleMode = $chartSpecificSettings.confidenceBandLineChart.xScaleMode.selectedValue;
  $: nBins = $chartSpecificSettings.confidenceBandLineChart.bins.selectedValue;
  $: colourScheme = $chartSpecificSettings.confidenceBandLineChart.colourScheme.selectedValue;

  // Modes for x-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";

  // General chart settings
  const margin = { top: 20, right: 10, bottom: 30, left: 50 };
  const timelineMargin = { top: 20, right: 10, bottom: 30, left: 50 };

  let width, height, xScaleBins, xScale, yScale, sliceXScale;
  let lineGenerator,
    medianLineGenerator,
    iqrAreaGenerator,
    minMaxAreaGenerator,
    selectedLineGenerator;
  let svg;
  let xAxisTickFormat;

  let binSize = 0;
  let binnedData, aggregatedData;

  // Initialize global x- and y-scales
  $: {
    containerWidth = $globalSettings.width.selectedValue;
    containerHeight = $globalSettings.height.selectedValue;
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;
    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.maxValue)])
      .range([height, 0]);

    xScaleBins = d3.scaleLinear().range([0, width]);
  }

  $: if (data.length > 0) {
    aggregatedData = [];
    binnedData = [];

    // Determine bin size based on selected x-scale mode
    if (xScaleMode === ABSOLUTE_DURATION) {
      binSize = d3.max(data, (d) => d.duration) / nBins;
      xScale = d3
        .scaleLinear()
        .range([0, width])
        .domain([0, d3.max(data, (d) => d.duration)]);
      xAxisTickFormat = (d) => secondsToHM(d);
    } else if (xScaleMode === ABSOLUTE_TIME) {
      const minTime = d3.min(data, (d) => d3.min(d.values, (k) => k.time));
      const maxTime = d3.max(data, (d) => d3.max(d.values, (k) => k.time));
      // data.forEach((slice) => {
      //   console.log(slice);
      //   slice.values.forEach((d) => {
      //     // Ignore actual date; we only need time of day
      //     d.secondsSinceMidnight =
      //       d.timestamp.getHours() * 3600 +
      //       d.timestamp.getMinutes() * 60 +
      //       d.timestamp.getSeconds();

      //     d.dayTimestamp = new Date();
      //     d.dayTimestamp.setHours(d.timestamp.getHours());
      //     d.dayTimestamp.setMinutes(d.timestamp.getMinutes());
      //   });
      // });

      // // Extent for "bin" x-scale
      // const minTime = d3.min(data, (d) =>
      //   d3.min(d.values, (k) => k.secondsSinceMidnight)
      // );
      // const maxTime = d3.max(data, (d) =>
      //   d3.max(d.values, (k) => k.secondsSinceMidnight)
      // );

      // Determine size of single bin (in seconds)
      binSize = (maxTime.getTime() - minTime.getTime()) / nBins / 1000;

      // binSize = (maxTime - minTime) / nBins;

      // Extent for regular x-scale, used for x-axis and highlighting selected time slice
      // const minTimestamp = d3.min(data, (d) =>
      //   d3.min(d.values, (k) => k.dayTimestamp)
      // );
      // const maxTimestamp = d3.max(data, (d) =>
      //   d3.max(d.values, (k) => k.dayTimestamp)
      // );
      xScale = d3
        .scaleTime()
        .range([0, width])
        .domain([minTime, maxTime]);
      xAxisTickFormat = d3.timeFormat("%H:%M");
    } else {
      // NORMALIZED_DURATION
      xScale = d3.scaleLinear().range([0, width]).domain([0, 100]);
      xAxisTickFormat = (d) => d + "%";
    }

    data.forEach((slice) => {
      // Bin size is variable depending on length of time slice
      if (xScaleMode === NORMALIZED_DURATION) {
        binSize = slice.duration / nBins;
        sliceXScale = d3
          .scaleLinear()
          .domain([0, d3.max(slice.values, (d) => d.secondsSinceStart)])
          .range([0, 100]);
      }

      slice.values.forEach((d) => {
        let bin = 0;
        if (xScaleMode === NORMALIZED_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
          d.xPos = sliceXScale(d.secondsSinceStart);
        } else if (xScaleMode === ABSOLUTE_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
          d.xPos = d.secondsSinceStart;
        } else {
          // ABSOLUTE_TIME
          // Find bin for current data point based on the time since start of the minimum time
          let secondsSinceMinTime = (d.time.getTime() - xScale.domain()[0].getTime()) / 1000;
          bin = Math.floor(secondsSinceMinTime / binSize);
        }
        bin = Math.max(0, Math.min(nBins - 1, bin));

        binnedData[bin] = binnedData[bin] || [];
        binnedData[bin].push(d.value);
      });
    });

    // Aggregate data from bins
    binnedData.forEach((bin, index) => {
      bin.sort();
      let binStats = {
        xPos: index,
        minValue: d3.min(bin),
        maxValue: d3.max(bin),
        avgValue: d3.mean(bin),
        medianValue: d3.median(bin),
        lowerQuartileValue: d3.quantile(bin, 0.25),
        upperQuartileValue: d3.quantile(bin, 0.75),
      };
      aggregatedData.push(binStats);
    });

    xScaleBins.domain([0, aggregatedData.length - 1]);

    lineGenerator = d3
      .line()
      .x((d) => xScaleBins(d.xPos))
      .y((d) => yScale(d.avgValue));

    medianLineGenerator = d3
      .line()
      .x((d) => xScaleBins(d.xPos))
      .y((d) => yScale(d.medianValue));

    iqrAreaGenerator = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => xScaleBins(d.xPos))
      .y0((d) => yScale(d.lowerQuartileValue))
      .y1((d) => yScale(d.upperQuartileValue));

    minMaxAreaGenerator = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => xScaleBins(d.xPos))
      .y0((d) => yScale(d.minValue))
      .y1((d) => yScale(d.maxValue));

    // For selected time slice (via timeline)
    selectedLineGenerator = d3
      .line()
      .x((d) => xScale(d.xPos))
      .y((d) => yScale(d.value));
  }

  let xAxisLabel;
  $: switch (xScaleMode) {
      case NORMALIZED_DURATION:
        xAxisLabel = 'Slice duration (%)';
        break;
      case ABSOLUTE_DURATION:
        xAxisLabel = 'Slice duration (hours:minutes)';
        break;
      default:
        xAxisLabel = 'Time of day';
  }
</script>

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <text
    class="axis-label"
    text-anchor="end"
    transform="translate(10, {margin.top}), rotate(-90)"
  >{$dataSource.variable ? $dataSource.variable : 'Value' }</text>
  <text
    class="axis-label"
    dy="0.71em"
    transform="translate({margin.left},0)"
  >{xAxisLabel} →</text>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    {#if selectedLayers.includes("min-max")}
      <path
        class="ts-min-max {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        d={minMaxAreaGenerator(aggregatedData)}
      />
    {/if}
    {#if selectedLayers.includes("percentiles")}
      <path
        class="ts-iqr {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        d={iqrAreaGenerator(aggregatedData)}
      />
    {/if}
    {#if selectedLayers.includes("average")}
      <path
        class="ts-avg {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        d={lineGenerator(aggregatedData)}
      />
    {/if}
    {#if selectedLayers.includes("median")}
      <path
        class="ts-median-2 {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        d={medianLineGenerator(aggregatedData)}
      />
    {/if}

    {#if activeIndex}
      <path
        transition:fade={{ duration: 200 }}
        class="ts-avg selected"
        d={selectedLineGenerator(data[activeIndex].values)}
      />
    {/if}

    <!-- Add axes -->
    <Axis 
      {width} 
      {height} 
      tickFormat={(d) => abbreviateNumber(d)} 
      scale={yScale} 
      position="left" 
    />
    <Axis 
      {width} 
      {height} 
      tickFormat={xAxisTickFormat} 
      scale={xScale} 
      position="bottom"
    />
  </g>
</svg>

{#if $globalSettings.showTimeline.selectedValue}
  <Timeline {data} bind:activeIndex margin={timelineMargin} />
{/if}

<SparkboxLegend
  selectedLayers={selectedLayers}
  colourScheme={colourScheme}
/>

<style>
</style>
