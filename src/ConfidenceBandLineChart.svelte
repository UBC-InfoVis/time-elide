<script>
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import {
    containerWidth,
    containerHeight,
    chartSpecificSettings,
  } from "./stores";
  import { secondsToHM } from "./utilities";

  import Timeline from "./Timeline.svelte";
  import Axis from "./Axis.svelte";

  export let data;

  // Store selected time slice
  let activeIndex;

  let selectedLayers =
    $chartSpecificSettings.confidenceBandLineChart.layers.default;
  // get selected layers from store and save in local var
  $: {
    selectedLayers =
      $chartSpecificSettings.confidenceBandLineChart.layers.selectedValue;
  }

  // Modes for x-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";
  const xScaleModes = [NORMALIZED_DURATION, ABSOLUTE_DURATION, ABSOLUTE_TIME];
  let selectedXScaleMode = NORMALIZED_DURATION;

  // General chart settings
  const margin = { top: 20, right: 10, bottom: 30, left: 40 };
  const timelineMargin = { top: 20, right: 10, bottom: 30, left: 40 };

  let width, height, xScaleBins, xScale, yScale, sliceXScale;
  let lineGenerator,
    iqrAreaGenerator,
    minMaxAreaGenerator,
    selectedLineGenerator;
  let svg;
  let xAxisTickFormat;

  let binSize = 0;
  let nBins = 100;
  let binnedData, aggregatedData;

  // Initialize global x- and y-scales
  $: {
    width = $containerWidth - margin.left - margin.right;
    height = $containerHeight - margin.top - margin.bottom;
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
    if (selectedXScaleMode == ABSOLUTE_DURATION) {
      binSize = d3.max(data, (d) => d.duration) / nBins;
      xScale = d3
        .scaleLinear()
        .range([0, width])
        .domain([0, d3.max(data, (d) => d.duration)]);
    } else if (selectedXScaleMode == ABSOLUTE_TIME) {
      data.forEach((slice) => {
        slice.values.forEach((d) => {
          // Ignore actual date; we only need time of day
          d.secondsSinceMidnight =
            d.timestamp.getHours() * 3600 +
            d.timestamp.getMinutes() * 60 +
            d.timestamp.getSeconds();

          d.dayTimestamp = new Date();
          d.dayTimestamp.setHours(d.timestamp.getHours());
          d.dayTimestamp.setMinutes(d.timestamp.getMinutes());
        });
      });

      // Extent for "bin" x-scale
      const minTime = d3.min(data, (d) =>
        d3.min(d.values, (k) => k.secondsSinceMidnight)
      );
      const maxTime = d3.max(data, (d) =>
        d3.max(d.values, (k) => k.secondsSinceMidnight)
      );
      binSize = (maxTime - minTime) / nBins;

      // Extent for regular x-scale, used for x-axis and highlighting selected time slice
      const minTimestamp = d3.min(data, (d) =>
        d3.min(d.values, (k) => k.dayTimestamp)
      );
      const maxTimestamp = d3.max(data, (d) =>
        d3.max(d.values, (k) => k.dayTimestamp)
      );
      xScale = d3
        .scaleTime()
        .range([0, width])
        .domain([minTimestamp, maxTimestamp]);
    } else {
      // NORMALIZED_DURATION
      xScale = d3.scaleLinear().range([0, width]).domain([0, 100]);
    }

    data.forEach((slice) => {
      // Bin size is variable depending on length of time slice
      if (selectedXScaleMode == NORMALIZED_DURATION) {
        binSize = slice.duration / nBins;
        sliceXScale = d3
          .scaleLinear()
          .domain([0, d3.max(slice.values, (d) => d.secondsSinceStart)])
          .range([0, 100]);
      }

      slice.values.forEach((d) => {
        let bin = 0;
        if (selectedXScaleMode == NORMALIZED_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
          d.xPos = sliceXScale(d.secondsSinceStart);
        } else if (selectedXScaleMode == ABSOLUTE_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
          d.xPos = d.secondsSinceStart;
        } else {
          // ABSOLUTE_TIME
          bin = Math.floor(d.secondsSinceMidnight / binSize);
          d.xPos = d.dayTimestamp;
        }

        binnedData[bin] = binnedData[bin] || [];
        binnedData[bin].push(d.value);
      });
    });

    console.log(data);

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
</script>

<select bind:value={selectedXScaleMode}>
  {#each xScaleModes as mode}
    <option value={mode}>{mode}</option>
  {/each}
</select>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    {#if selectedLayers.includes("min-max")}
      <path class="ts-min-max" d={minMaxAreaGenerator(aggregatedData)} />
    {/if}
    {#if selectedLayers.includes("iqr")}
      <path class="ts-iqr" d={iqrAreaGenerator(aggregatedData)} />
    {/if}
    {#if selectedLayers.includes("avg")}
      <path class="ts-avg" d={lineGenerator(aggregatedData)} />
    {/if}

    {#if activeIndex}
      <path
        transition:fade={{ duration: 200 }}
        class="ts-avg selected"
        d={selectedLineGenerator(data[activeIndex].values)}
      />
    {/if}

    <!-- Add axes -->
    <Axis {width} {height} scale={yScale} position="left" />
    <Axis {width} {height} scale={xScale} position="bottom" />
  </g>
</svg>

<Timeline {data} bind:activeIndex margin={timelineMargin} />

<style>
</style>
