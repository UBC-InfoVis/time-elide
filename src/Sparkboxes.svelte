<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import {
    globalSettings,
    tooltipData,
    chartSpecificSettings,
    dataSource
  } from "./stores";
  import { abbreviateNumber } from "./utilities";
  import Timeline from "./Timeline.svelte";
  import TimeSliceAxis from "./TimeSliceAxis.svelte";
  import Axis from "./Axis.svelte";
  import SparkboxLegend from "./SparkboxLegend.svelte";

  export let data;

  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 60 };
  const timelineMargin = { top: 10, right: 15, bottom: 30, left: 60 };

  let width, height, xScale, yScale, xPosKey, normalizeSliceWidths;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;
  let showTooltip = $globalSettings.showTooltip.default;

  let selectedLayers = $chartSpecificSettings.sparkboxes.layers.default;
  let colourScheme = $chartSpecificSettings.sparkboxes.colourScheme.default;
  let showGridLines = $chartSpecificSettings.sparkboxes.showGridLines.default;

  // get selected layers from store and save in local var
  $: selectedLayers = $chartSpecificSettings.sparkboxes.layers.selectedValue;
  $: colourScheme = $chartSpecificSettings.sparkboxes.colourScheme.selectedValue;
  $: showTooltip = $globalSettings.showTooltip.selectedValue;
  $: normalizeSliceWidths = $chartSpecificSettings.sparkboxes.normalizeSliceWidths.selectedValue;
  $: showGridLines = $chartSpecificSettings.sparkboxes.showGridLines.selectedValue;

  // Initialize global x- and y-scales
  $: {
    containerWidth = $globalSettings.width.selectedValue;
    width = containerWidth - margin.left - margin.right;
    xScale = d3.scaleLinear();

    // Define what slice attribute is used for the 'position' and 'width' of time slices
    // id is an ordinal integer attribute used for normalized slice widths
    // xPos is based on the cumulative slice duration
    xPosKey = normalizeSliceWidths ? 'id' : 'xPos';
  }

  $: {
    containerHeight = $globalSettings.height.selectedValue;
    height = containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleLinear();
  }

  $: {
    let xExtent = d3.extent(data, (d) => d[xPosKey]);
    // Add width of last slice (xPos is always the beginning of a slice)
    if (data.length > 0 && !normalizeSliceWidths) {
      xExtent[1] += data[data.length - 1].duration;
    } else {
      xExtent[1] += 1;
    }
    xScale.domain(xExtent).range([0, width]);
    zoomXScale = xScale;
  }

  $: yScale.domain([0, d3.max(data, (d) => d.maxValue)]).range([height, 0]);

  // The widths of slices are variable so we need to prepare custom x-scales and line generators
  $: data.forEach((slice) => {
    slice.xScaleCustom = d3
      .scaleTime()
      .domain(d3.extent(slice.values, (d) => d.timestamp));
  });

  // Allow users to zoom into 4 slices
  $: maxZoomFactor = Math.max(1, data.length / 4);

  // Line path generator based on default or normalized x-scale and global y-scale
  function getSvgAveragePath(slice, zoomFactor, normalized, xScale, yScale) {
    if (normalized) {
      slice.xScaleCustom.range([0, zoomFactor * xScale(1)]);
    } else {
      slice.xScaleCustom.range([0, zoomFactor * xScale(slice.duration)]);
    }
    let lineGenerator = d3
      .line()
      .x((d) => slice.xScaleCustom(d.timestamp))
      .y((d) => yScale(d.value));
    return lineGenerator(slice.values);
  }

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

  function zoomed({ transform }) {
    zoomXScale = transform.rescaleX(xScale);
    zoomFactor = transform.k;
    zoomTransform = transform;
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
  >Date →</text>
  <defs>
    <clipPath id="clip">
      <rect {width} {height} />
    </clipPath>
  </defs>
  <g transform="translate({margin.left},{margin.top})">
    <g clip-path="url(#clip)">
      <!-- Bind data to SVG elements -->
      {#each data as slice, index}
        {#if slice[xPosKey] >= zoomXScale.domain()[0]-1 || slice[xPosKey] <= zoomXScale.domain()[1]+1}
          <g
            transform="translate({zoomXScale(slice[xPosKey])},0)"
            class={index == activeIndex ? "selected" : ""}
          >
            {#if selectedLayers.includes("min-max")}
              <rect
                class="ts-min-max {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                width={normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)}
                height={yScale(slice.minValue) - yScale(slice.maxValue)}
                y={yScale(slice.maxValue)}
              />
            {/if}
            {#if selectedLayers.includes("quartiles")}
              <rect
                class="ts-iqr {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                width={normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)}
                height={yScale(slice.lowerQuartileValue) -
                  yScale(slice.upperQuartileValue)}
                y={yScale(slice.upperQuartileValue)}
              />
            {/if}
            {#if selectedLayers.includes("median")}
              <line
                class="ts-median-2 {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                x2={normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)}
                y1={yScale(slice.medianValue)}
                y2={yScale(slice.medianValue)}
              />
            {/if}
            {#if selectedLayers.includes("average")}
              <line
                class="ts-median {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                x2={normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)}
                y1={yScale(slice.avgValue)}
                y2={yScale(slice.avgValue)}
              />
            {/if}
            {#if selectedLayers.includes("raw data")}
              <path
                class="ts-avg {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                d={getSvgAveragePath(slice, zoomFactor, normalizeSliceWidths, xScale, yScale)}
              />
            {/if}
            {#if data.length <= 50}
              <text
                class="ts-x-label"
                y={height + 20}
                x={zoomXScale(slice.duration) / 2}>{index + 1}</text
              >
            {/if}
            <rect
              class="ts-overlay"
              width={normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)}
              {height}
              on:mouseover={(event) => {
                activeIndex = index;
                let activeAggregation = 'avgValue';
                let aggregationTitle = 'average';
                if (!selectedLayers.includes("average") && selectedLayers.includes("median")) {
                  activeAggregation = 'medianValue';
                  aggregationTitle = 'median';
                }
                if (showTooltip) {
                  tooltipData.set({
                    slice: slice,
                    coordinates: [event.pageX, event.pageY],
                    referenceLine: {
                      value: slice[activeAggregation],
                      title: aggregationTitle
                    }
                  });
                }
              }}
              on:mousemove={(event) =>
                ($tooltipData.coordinates = [event.pageX, event.pageY])}
              on:mouseout={() => {
                activeIndex = null;
                tooltipData.set(undefined);
              }}
            />
            {#if showGridLines}
              <line
                y2={height}
                class="gridline"
                transform="translate({normalizeSliceWidths
                  ? zoomFactor * xScale(1)
                  : zoomFactor * xScale(slice.duration)
                },0)"
              />
            {/if}
          </g>
        {/if}
      {/each}
    </g>

    <!-- Add y-axis -->
    <Axis
      {width}
      {height}
      tickFormat={(d) => abbreviateNumber(d)}
      scale={yScale}
      position="left"
    />

    <!-- Add x-axis -->
    <TimeSliceAxis
      {width}
      {height}
      {xScale}
      xScaleType={normalizeSliceWidths ? "linear-normalized" : "linear"}
      {data}
      {zoomFactor}
      {zoomXScale}
    />
  </g>
</svg>
{#if $globalSettings.showTimeline.selectedValue}
  <Timeline
    {data}
    bind:activeIndex
    margin={timelineMargin}
    zoom={zoomTransform}
  />
{/if}

<SparkboxLegend
  selectedLayers={selectedLayers}
  colourScheme={colourScheme}
/>

<style>
</style>
