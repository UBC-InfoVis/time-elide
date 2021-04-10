<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import {
    containerWidth,
    containerHeight,
    tooltipData,
    chartSpecificSettings,
  } from "./stores";
  import { secondsToHM } from "./utilities";
  import Axis from "./Axis.svelte";
  import TimeSliceAxis from "./TimeSliceAxis.svelte";
  import Timeline from "./Timeline.svelte";

  export let data;
  let displayData;

  const margin = { top: 20, right: 10, bottom: 40, left: 50 };
  const timelineMargin = { top: 20, right: 10, bottom: 30, left: 50 };

  let width, height, xScale, yScale, yScaleBinned, colorScale;
  let yAxisTickFormat;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let showTimeline = $chartSpecificSettings.dotHeatmap.showTimeline.default;
  let nBins = $chartSpecificSettings.dotHeatmap.bins.default;

  $: {
    showTimeline = $chartSpecificSettings.dotHeatmap.showTimeline.selectedValue;
  }
  $: {
    nBins = $chartSpecificSettings.dotHeatmap.bins.selectedValue;
  }

  // let nBins = 10;
  let binSize = 0;

  // Modes for y-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";
  const yScaleModes = [NORMALIZED_DURATION, ABSOLUTE_DURATION, ABSOLUTE_TIME];
  let selectedYScaleMode = NORMALIZED_DURATION;

  $: {
    width = $containerWidth - margin.left - margin.right;
    height = $containerHeight - margin.top - margin.bottom;

    // Build Y scale:
    yScale = d3.scaleTime();

    yScaleBinned = d3
      .scaleBand()
      .range([0, height])
      .domain(Array.from(Array(nBins).keys()))
      .padding(0);
  }

  $: if (data.length > 0) {
    // Determine bin size and domain of y-scale based on selected y-scale mode
    if (selectedYScaleMode == ABSOLUTE_DURATION) {
      binSize = d3.max(data, (d) => d.duration) / nBins;
      yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.duration)]);
      yAxisTickFormat = (d) => secondsToHM(d);
    } else if (selectedYScaleMode == ABSOLUTE_TIME) {
      // Extent for regular y-scale which is used for the y-axis
      const minTime = d3.min(data, (d) => d3.min(d.values, (k) => k.time));
      const maxTime = d3.max(data, (d) => d3.max(d.values, (k) => k.time));
      yScale = d3.scaleTime().domain([minTime, maxTime]);

      // Determine size of single bin (in seconds)
      binSize = (maxTime.getTime() - minTime.getTime()) / nBins / 1000;
      yAxisTickFormat = d3.timeFormat("%H:%M");
    } else {
      // NORMALIZED_DURATION
      yScale = d3.scaleLinear().domain([0, 100]);
      yAxisTickFormat = (d) => d + "%";
    }
    yScale.range([0, height]);

    // Assign orginal time-value pairs to bins
    data.forEach((slice) => {
      let binnedData = [];

      // Bin size is variable depending on length of time slice
      if (selectedYScaleMode == NORMALIZED_DURATION) {
        binSize = slice.duration / nBins;
      }

      slice.values.forEach((d) => {
        let bin = 0;
        if (selectedYScaleMode == NORMALIZED_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
        } else if (selectedYScaleMode == ABSOLUTE_DURATION) {
          bin = Math.floor(d.secondsSinceStart / binSize);
        } else {
          // ABSOLUTE_TIME
          // Find bin for current data point based on the time since start of the minimum time
          let secondsSinceMinTime =
            (d.time.getTime() - yScale.domain()[0].getTime()) / 1000;
          bin = Math.floor(secondsSinceMinTime / binSize);
        }
        bin -= 1;
        bin = Math.max(0, Math.min(nBins - 1, bin));

        binnedData[bin] = binnedData[bin] || [];
        binnedData[bin].push(d.value);
      });

      slice.aggregatedData = undefined;
      slice.aggregatedData = [];
      binnedData.forEach((binValues, index) => {
        slice.aggregatedData = [
          ...slice.aggregatedData,
          { pos: index, value: d3.mean(binValues) },
        ];
      });
    });

    displayData = data;
  }

  // Build X scale:
  $: {
    xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.id))
      .range([0, width])
      .padding(0.1);

    zoomXScale = xScale;
  }

  // Build color scale:
  $: {
    const globalMinValue = d3.min(data, (d) => d.minValue);
    const globalMaxValue = d3.max(data, (d) => d.maxValue);
    colorScale = d3
      .scaleSequential()
      .domain([globalMinValue, globalMaxValue])
      .interpolator(d3.interpolateBlues);
  }

  // Allow users to zoom into 8 slices
  $: maxZoomFactor = Math.max(1, data.length / 8);

  onMount(() => {
    d3.select(svg).call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([1, maxZoomFactor])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", zoomed)
    );
  });

  function zoomed(event) {
    zoomXScale = d3
      .scaleBand()
      .padding(0.1)
      .domain(xScale.domain())
      .range([0, width].map((d) => event.transform.applyX(d)));
  }
</script>

<div>
  Y-Scale:
  <select bind:value={selectedYScaleMode}>
    {#each yScaleModes as mode}
      <option value={mode}>{mode}</option>
    {/each}
  </select>
</div>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <defs>
    <clipPath id="clip">
      <rect {width} {height} />
    </clipPath>
  </defs>
  <g transform="translate({margin.left},{margin.top})">
    <g clip-path="url(#clip)">
      {#each displayData as slice, index}
        <g
          transform="translate({zoomXScale(slice.id)},0)"
          class={index == activeIndex ? "selected" : ""}
        >
          {#each slice.aggregatedData as bin}
            <rect
              class="heatmap-cell"
              y={yScaleBinned(bin.pos)}
              width={zoomXScale.bandwidth()}
              fill={colorScale(bin.value)}
              height={yScaleBinned.bandwidth()}
            />
          {/each}
          <rect
            class="ts-overlay"
            x="-1px"
            width={zoomXScale.bandwidth() + 2}
            {height}
            on:mouseover={(event) => {
              activeIndex = index;
              tooltipData.set({
                slice: slice,
                coordinates: [event.pageX, event.pageY],
              });
            }}
            on:mousemove={(event) =>
              ($tooltipData.coordinates = [event.pageX, event.pageY])}
            on:mouseout={() => {
              activeIndex = null;
              tooltipData.set(undefined);
            }}
          />
        </g>
      {/each}
    </g>

    <TimeSliceAxis
      {width}
      {height}
      xScale={zoomXScale}
      data={displayData}
      {zoomXScale}
    />
    <Axis
      {width}
      {height}
      tickFormat={yAxisTickFormat}
      scale={yScale}
      position="left"
    />
  </g>
</svg>

{#if showTimeline}
  <Timeline
    {data}
    bind:activeIndex
    margin={timelineMargin}
    zoom={zoomTransform}
  />
{/if}

<style>
  .heatmap-cell {
    shape-rendering: crispEdges;
  }
  .ts-overlay {
    stroke-width: 2px;
  }
  .selected .ts-overlay {
    stroke: #885e5e;
  }
</style>
