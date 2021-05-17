<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  import { tooltipData, dataSource } from "../../stores/ui";
  import {
    globalSettings,
    chartSpecificSettings,
  } from "../../stores/chartConfig";

  import Timeline from "../chart_support/Timeline.svelte";
  import TimeSliceAxis from "../chart_support/TimeSliceAxis.svelte";
  import ColourLegend from "../chart_support/ColourLegend.svelte";

  export let data;

  const margin = { top: 20, right: 5, bottom: 30, left: 15 };
  const timelineMargin = { top: 10, right: 5, bottom: 30, left: 15 };

  let width, height, xScale, colorScale, xPosKey;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  let aggregationOptions = {
    average: "avgValue",
    max: "maxValue",
    median: "medianValue",
    min: "minValue",
  };

  // Store selected time slice
  let activeIndex;

  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;
  let showTooltip = $globalSettings.showTooltip.default;

  let aggregation = $chartSpecificSettings.heatStripes.aggregation.default;
  let normalizeSliceWidths =
    $chartSpecificSettings.heatStripes.normalizeSliceWidths.default;
  let normalizedWidth;
  $: aggregationValue = aggregationOptions[aggregation];

  $: {
    aggregation = $chartSpecificSettings.heatStripes.aggregation.selectedValue;
  }
  $: {
    normalizeSliceWidths =
      $chartSpecificSettings.heatStripes.normalizeSliceWidths.selectedValue;
  }
  $: {
    showTooltip = $globalSettings.showTooltip.selectedValue;
  }

  $: {
    containerWidth = $globalSettings.width.selectedValue;
    containerHeight = $globalSettings.height.selectedValue;
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;
    xScale = d3.scaleLinear();

    // Define what slice attribute is used for the 'position' and 'width' of time slices
    // id is an ordinal integer attribute used for normalized slice widths
    // xPos is based on the cumulative slice duration
    xPosKey = normalizeSliceWidths ? "id" : "xPos";
  }

  $: {
    colorScale = d3
      .scaleSequential()
      .domain(d3.extent(data, (d) => d[aggregationValue]))
      .interpolator(d3.interpolateBlues);
  }

  $: {
    let xExtent = d3.extent(data, (d) => d[xPosKey]);
    if (data.length > 0 && !normalizeSliceWidths) {
      xExtent[1] += data[data.length - 1].duration;
    } else {
      xExtent[1] += 1;
    }
    xScale.domain(xExtent).range([0, width]);
    zoomXScale = xScale;
  }

  // Allow users to zoom into 4 slices
  $: maxZoomFactor = Math.max(1, data.length / 4);

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
  <text class="axis-label" dy="0.71em" transform="translate({margin.left},0)"
    >Date →</text
  >
  <g transform="translate({margin.left},{margin.top})">
    {#each data as slice, index}
      {#if slice[xPosKey] >= zoomXScale.domain()[0] - 1 || slice[xPosKey] <= zoomXScale.domain()[1] + 1}
        {#if slice.values.length > 0}
          <rect
            x={zoomXScale(slice[xPosKey])}
            width={normalizeSliceWidths
              ? zoomFactor * xScale(1)
              : zoomFactor * xScale(slice.duration)}
            fill={colorScale(slice[aggregationValue])}
            {height}
            on:mouseover={(event) => {
              activeIndex = index;
              if (showTooltip) {
                tooltipData.set({
                  slice: slice,
                  coordinates: [event.pageX, event.pageY],
                  referenceLine: {
                    value: slice[aggregationValue],
                    title: aggregation,
                  },
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
        {:else}
          <g
            class="missing-data-cross"
            transform="translate({normalizeSliceWidths
              ? zoomXScale(slice[xPosKey]) + (zoomFactor * xScale(1)) / 2
              : zoomXScale(slice[xPosKey]) +
                (zoomFactor * xScale(slice.duration)) / 2},{height - 10})"
          >
            <line x1={-3} x2={3} y1={-3} y2={3} />
            <line x1={-3} x2={3} y1={3} y2={-3} />
          </g>
        {/if}
      {/if}
    {/each}

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

<div class="uk-margin-small-top">
  <ColourLegend
    scale={colorScale}
    title={$dataSource.variable ? $dataSource.variable : "Value"}
    margin={{ top: 15, right: 30, bottom: 20, left: 15 }}
  />
</div>

<style>
  rect {
    shape-rendering: crispEdges;
  }
  rect:hover {
    stroke: red;
  }
</style>
