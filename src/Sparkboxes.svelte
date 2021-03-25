<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { containerWidth, containerHeight } from "./stores";

  import Timeline from "./Timeline.svelte";
  import Axis from "./Axis.svelte";

  export let data;

  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 40 };
  const timelineMargin = { top: 20, right: 15, bottom: 30, left: 40 };

  let width, height, xScale, yScale;
  let svg;

  // Store selected time slice
  let activeIndex;

  // Initialize global x- and y-scales
  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = d3.scaleLinear();
  }

  $: {
    height = $containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleLinear();
  }

  $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    // Add width of last slice (xPos is always the beginning of a slice)
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
  }

  $: yScale.domain([0, d3.max(data, (d) => d.maxValue)]).range([height, 0]);

  // The widths of slices are variable so we need to prepare custom x-scales and line generators
  $: data.forEach((slice) => {
    slice.xScaleCustom = d3
      .scaleTime()
      .domain(d3.extent(slice.values, (d) => d.timestamp))
      .range([0, xScale(slice.duration)]);

    // Line path generator based on custom x-scale and global y-scale
    slice.lineGenerator = d3
      .line()
      .x((d) => slice.xScaleCustom(d.timestamp))
      .y((d) => yScale(d.value));
  });
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    {#each data as slice, index}
      <g 
        transform="translate({xScale(slice.xPos)},0)"
        class={index == activeIndex ? "selected" : "" }
      >
        <rect
          class="ts-min-max"
          width={xScale(slice.duration)}
          height={yScale(slice.minValue) - yScale(slice.maxValue)}
          y={yScale(slice.maxValue)}
        />
        <rect
          class="ts-iqr"
          width={xScale(slice.duration)}
          height={yScale(slice.lowerQuartileValue) -
            yScale(slice.upperQuartileValue)}
          y={yScale(slice.upperQuartileValue)}
        />
        <line
          class="ts-median"
          x2={xScale(slice.duration)}
          y1={yScale(slice.medianValue)}
          y2={yScale(slice.medianValue)}
        />
        <path class="ts-avg" d={slice.lineGenerator(slice.values)} />
        {#if data.length <= 50}
          <text class="ts-x-label" y={height + 20} x={xScale(slice.duration) / 2}
            >{index + 1}</text>
        {/if}
        <rect
          class="ts-overlay"
          width={xScale(slice.duration)}
          height={height}
          on:mouseover={() => activeIndex = index }
          on:mouseout={() => activeIndex = null }
        />
      </g>
    {/each}

    <!-- Add y-axis -->
    <Axis {width} {height} scale={yScale} position="left" />

    <!-- Add x-axis line at the bottom -->
    <line
      y1={height + 1}
      y2={height + 1}
      x2={width}
      class="gridline gridline-primary"
    />
  </g>
</svg>

<Timeline data={data} bind:activeIndex={activeIndex} margin={timelineMargin} />

<style>
</style>
