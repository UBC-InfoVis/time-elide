<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { Boundary } from "@crownframework/svelte-error-boundary";
  import {
    tooltipData,
    dataSource,
    slicerErrorMessage,
    validSlicingSelection,
  } from "../../stores/ui";
  import {
    globalSettings,
    chartSpecificSettings,
  } from "../../stores/chartConfig";

  import { secondsToHM } from "../../utilities";
  import Axis from "../chart_support/Axis.svelte";
  import TimeSliceAxis from "../chart_support/TimeSliceAxis.svelte";
  import Timeline from "../chart_support/Timeline.svelte";
  import ColourLegend from "../chart_support/ColourLegend.svelte";
  import InteractionLegend from "../chart_support/InteractionLegend.svelte";
  import { RENDERING_ERROR } from "../../default_values/constants";

  export let data;
  let displayData;

  const margin = { top: 20, right: 10, bottom: 40, left: 60 };
  const timelineMargin = { top: 10, right: 10, bottom: 30, left: 60 };

  let width, height, xScale, yScale, yScaleBinned, colorScale;
  let yAxisTickFormat;
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

  let nBins = $chartSpecificSettings.heatmap.bins.default;
  let yScaleMode = $chartSpecificSettings.heatmap.xScaleMode.default;
  let aggregation = $chartSpecificSettings.heatmap.aggregation.default;

  $: {
    nBins = $chartSpecificSettings.heatmap.bins.selectedValue;
  }
  $: {
    yScaleMode = $chartSpecificSettings.heatmap.xScaleMode.selectedValue;
  }
  $: {
    aggregation = $chartSpecificSettings.heatmap.aggregation.selectedValue;
  }
  $: {
    showTooltip = $globalSettings.showTooltip.selectedValue;
  }

  let binSize = 0;

  // Modes for y-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";

  $: {
    containerWidth = $globalSettings.width.selectedValue;
    containerHeight = $globalSettings.height.selectedValue;
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;

    // Build Y scale:
    yScale = d3.scaleTime();

    yScaleBinned = d3
      .scaleBand()
      .range([0, height])
      .domain(Array.from(Array(nBins).keys()))
      .padding(0);
  }

  $: if (data.length > 0) {
    try {
      // Determine bin size and domain of y-scale based on selected y-scale mode
      if (yScaleMode === ABSOLUTE_DURATION) {
        binSize = d3.max(data, (d) => d.duration) / nBins;
        yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.duration)]);
        yAxisTickFormat = (d) => secondsToHM(d);
      } else if (yScaleMode === ABSOLUTE_TIME) {
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

      let k = false;

      // Assign orginal time-value pairs to bins
      data.forEach((slice, index) => {
        let binnedData = [];

        // Bin size is variable depending on length of time slice
        if (yScaleMode === NORMALIZED_DURATION) {
          binSize = slice.duration / nBins;
        }

        slice.values.forEach((d) => {
          let bin = 0;
          if (yScaleMode === NORMALIZED_DURATION) {
            bin = Math.floor(d.secondsSinceStart / binSize);
          } else if (yScaleMode === ABSOLUTE_DURATION) {
            bin = Math.floor(d.secondsSinceStart / binSize);
          } else {
            // ABSOLUTE_TIME
            // Find bin for current data point based on the time since start of the minimum time
            let secondsSinceMinTime =
              (d.time.getTime() - yScale.domain()[0].getTime()) / 1000;
            bin = Math.floor(secondsSinceMinTime / binSize);
          }
          bin = Math.max(0, Math.min(nBins - 1, bin));

          binnedData[bin] = binnedData[bin] || [];
          binnedData[bin].push(d.value);
        });

        slice.aggregatedData = undefined;
        slice.aggregatedData = [];
        binnedData.forEach((binValues, index) => {
          let processedValues;
          switch (aggregation) {
            case "average":
              processedValues = d3.mean(binValues);
              break;
            case "median":
              processedValues = d3.median(binValues);
              break;
            case "min":
              processedValues = d3.min(binValues);
              break;
            case "max":
              processedValues = d3.max(binValues);
              break;
            default:
              processedValues = d3.mean(binValues);
          }
          slice.aggregatedData = [
            ...slice.aggregatedData,
            { pos: index, value: processedValues },
          ];
        });
      });

      displayData = data;
    } catch (error) {
      slicerErrorMessage.set(RENDERING_ERROR);
      validSlicingSelection.set(false);
    }
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

  // Calculate bin duration in minutes
  $: chartSpecificSettings.update((settings) => {
    settings.heatmap.bins.binDuration =
      yScaleMode === NORMALIZED_DURATION ? undefined : Math.round(binSize / 60);
    return settings;
  });

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

  let yAxisLabel;
  $: switch (yScaleMode) {
    case NORMALIZED_DURATION:
      yAxisLabel = "slice duration as %";
      break;
    case ABSOLUTE_DURATION:
      yAxisLabel = "slice duration as hours:minutes";
      break;
    default:
      yAxisLabel = "time of day";
  }
</script>

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <Boundary onError={console.error}>
    <defs>
      <clipPath id="clip">
        <rect {width} {height} />
      </clipPath>
    </defs>
    <text
      class="axis-label"
      text-anchor="end"
      transform="translate(10, {margin.top}), rotate(-90)"
      >← {$dataSource.variable ? $dataSource.variable : "Value"} ({yAxisLabel})</text
    >
    <text class="axis-label" dy="0.71em" transform="translate({margin.left},0)"
      >Date →</text
    >
    <g transform="translate({margin.left},{margin.top})">
      <g clip-path="url(#clip)">
        {#each displayData as slice, index}
          <g
            transform="translate({zoomXScale(slice.id)},0)"
            class={index == activeIndex ? "selected" : ""}
          >
            {#if slice.values.length > 0}
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
                  if (showTooltip) {
                    tooltipData.set({
                      slice: slice,
                      coordinates: [event.pageX, event.pageY],
                      referenceLine: {
                        value: slice[aggregationOptions[aggregation]],
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
                transform="translate({zoomXScale.bandwidth() / 2},{height -
                  10})"
              >
                <line x1={-3} x2={3} y1={-3} y2={3} />
                <line x1={-3} x2={3} y1={3} y2={-3} />
              </g>
            {/if}
          </g>
        {/each}
      </g>

      <TimeSliceAxis
        {width}
        {height}
        xScaleType="band"
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
  </Boundary>
</svg>

{#if $globalSettings.showTimeline.selectedValue}
  <div>
    <Timeline
      {data}
      bind:activeIndex
      margin={timelineMargin}
      zoom={zoomTransform}
    />
  </div>
{/if}

<div class="uk-margin-medium-top">
  <ColourLegend
    scale={colorScale}
    title={$dataSource.variable ? $dataSource.variable : "Value"}
    margin={{ top: 15, right: 30, bottom: 20, left: 60 }}
  />

  <InteractionLegend leftMargin="20" />
</div>

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
