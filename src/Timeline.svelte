<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { fade } from 'svelte/transition';
  import { containerWidth } from "./stores";

  import Axis from "./Axis.svelte";

  export let data;
  export let activeIndex = undefined;
  export let margin;

  let containerHeight;
  let height = 15;
  let sliceHeight = 15;
  let minSliceWidth = 2;
  let width;
  let xScale, xScaleTime;
  let svg;

  const triangleSymbol = d3.symbol().type(d3.symbolTriangle).size(36);

  export let zoom;
  let zoomDomain;

  $: {
    width = $containerWidth - margin.left - margin.right;
    containerHeight = height + margin.top + margin.bottom;
    
    // Scale to position time slices
    xScaleTime = d3.scaleTime()
        .range([0, width]);

    // Scale to determine width of slices
    xScale = d3.scaleLinear()
        .range([0, width]);
  }

  $: {
    // Set input domain of x-scales based on start and end dates
    let minTimestamp = data[0].values[0].timestamp;
    let lastSliceValues = data[data.length-1].values;
    let maxTimestamp = lastSliceValues[lastSliceValues.length-1].timestamp;
    xScaleTime.domain([minTimestamp, maxTimestamp]);
    xScale.domain([0, (maxTimestamp.getTime() - minTimestamp.getTime()) / 1000]);
  }

  $: if (zoom) {
    zoomDomain = zoom.rescaleX(xScale).domain();
  }

</script>

<svg class="timeline" height={containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <line
      class="timeline-track"
      x2={width}
      y1={sliceHeight/2}
      y2={sliceHeight/2}
    />
    {#each data as slice,index }
      <g transform="translate({xScaleTime(slice.values[0].timestamp)}, 0)">
        <rect
          class="timeline-event {index == activeIndex ? 'selected' : '' }"
          width={Math.max(xScale(slice.duration), minSliceWidth)}
          height={sliceHeight}
          on:mouseover={() => activeIndex = index }
          on:mouseout={() => activeIndex = undefined }
        />
        {#if index == activeIndex }
          <path
            transition:fade="{{ duration: 200 }}"
            class="timeline-triangle"
            d={triangleSymbol()}
            transform="translate({Math.max(xScale(slice.duration), minSliceWidth)/2}, -7) rotate(180)"
          />
        {/if}
      </g>
    {/each}

    {#if zoomDomain }
      <line
        class="zoom-gate"
        x1={xScale(zoomDomain[0])}
        x2={xScale(zoomDomain[0])}
        y1={-sliceHeight/2}
        y2={sliceHeight + sliceHeight/2}
      />
      <line
        class="zoom-gate"
        x1={xScale(zoomDomain[1])}
        x2={xScale(zoomDomain[1])}
        y1={-sliceHeight/2}
        y2={sliceHeight + sliceHeight/2}
      />
    {/if}

    <Axis {width} {height} ticks={6} scale={xScaleTime} position="bottom" />
  </g>
</svg>

<style>
  .timeline-event {
    fill: #8889a0;
    shape-rendering: crispEdges;
  }
  .timeline-event.selected {
    fill: #885e5e;
  }
  .timeline-triangle {
    fill: #885e5e;
  }
  .timeline-track {
    stroke: #ddd;
    shape-rendering: crispEdges;
  }
  .timeline :global(.axis .domain) {
    display: none;
  }
  .timeline :global(.axis .tick line) {
    display: none;
  }
  .timeline :global(.axis text) {
    font-size: .7rem;
    fill: #7d7d7d;
  }
  .zoom-gate {
    stroke: #000;
    shape-rendering: crispEdges;
  }
</style>
