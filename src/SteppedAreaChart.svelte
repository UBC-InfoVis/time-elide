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

  export let data;

  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 60 };
  const timelineMargin = { top: 20, right: 15, bottom: 30, left: 60 };

  let width, height, xScale, yScale, xPosKey, normalizeSliceWidths;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let aggregationOptions = {
    average: "avgValue",
    max: "maxValue",
    median: "medianValue",
    min: "minValue"
  }

  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;
  let showTooltip = $globalSettings.showTooltip.default;

  let aggregation = $chartSpecificSettings.steppedAreaChart.aggregation.default;

  $: {
    aggregation =
      $chartSpecificSettings.steppedAreaChart.aggregation.selectedValue;

    yScale = d3.scaleLinear();
  }

  $: aggregationValue = aggregationOptions[aggregation];

  $: {
    normalizeSliceWidths =
      $chartSpecificSettings.steppedAreaChart.normalizeSliceWidths
        .selectedValue;
  }

  $: {
    showTooltip = $globalSettings.showTooltip.selectedValue;
  }

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
    yScale
        .domain([0, d3.max(data, (d) => d.maxValue)])
        .range([height, 0]);
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
      {#each data as slice, index}
        {#if slice[xPosKey] >= zoomXScale.domain()[0]-1 || slice[xPosKey] <= zoomXScale.domain()[1]+1}
          <g
            transform="translate({zoomXScale(slice[xPosKey])},0)"
            class={index == activeIndex ? "selected" : ""}
          >
            <rect
              class="ts"
              y={yScale(slice[aggregationValue])}
              height={height - yScale(slice[aggregationValue])}
              width={normalizeSliceWidths
                ? zoomFactor * xScale(1)
                : zoomFactor * xScale(slice.duration)}
            />
            <rect
              class="ts-overlay"
              width={normalizeSliceWidths
                ? zoomFactor * xScale(1)
                : zoomFactor * xScale(slice.duration)}
              {height}
              on:mouseover={(event) => {
                activeIndex = index;
                if (showTooltip) {
                  tooltipData.set({
                    slice: slice,
                    coordinates: [event.pageX, event.pageY],
                    referenceLine: {
                      value: slice[aggregationValue],
                      title: aggregation
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

            {#if data.length <= 50}
              <text
                class="ts-x-label"
                y={height + 20}
                x={zoomXScale(slice.duration) / 2}>{index + 1}</text
              >
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

<style>
  rect.ts {
    fill: #ccd3e2;
    shape-rendering: crispEdges;
  }
  .selected .ts {
    fill: #885e5e;
  }
</style>
