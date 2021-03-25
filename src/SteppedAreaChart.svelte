<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { containerWidth, containerHeight } from "./stores";

  import Timeline from "./Timeline.svelte";
  import Axis from "./Axis.svelte";

  export let data;

  const dataKey = "maxValue";
  
  // General chart settings
  const margin = { top: 20, right: 5, bottom: 30, left: 40 };
  const timelineMargin = { top: 20, right: 5, bottom: 30, left: 40 };

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

  $: yScale.domain([0, d3.max(data, (d) => d[dataKey])]).range([height, 0]);

  $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
  }

  $: barWidth = width / data.length;

  // Trick to make last step visible: clone last element
  // (to-do: maybe there is a better solution)
  // let areaData = [];
  // $: if (data.length > 0) {
  //   let tempSlice = Object.assign({}, data[data.length - 1]);
  //   tempSlice.xPos += tempSlice.duration;
  //   areaData = [...data, tempSlice];
  // }

  // D3 path generator to generate the coordinates
  // $: areaPath = d3
  //   .area()
  //   .curve(d3.curveStepAfter)
  //   .x((d) => xScale(d.xPos))
  //   .y1((d) => yScale(d[dataKey]))
  //   .y0(height);
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <!--<path class="area-path" d={areaPath(areaData)} />-->
   
    {#each data as slice, index}
      <g 
        transform="translate({xScale(slice.xPos)},0)"
        class={index == activeIndex ? "selected" : "" }
      >
        <rect
          class="ts"
          y={yScale(slice[dataKey])}
          height={height - yScale(slice[dataKey])}
          width={barWidth}
        />
        <rect
          class="ts-overlay"
          width={xScale(slice.duration)}
          height={height}
          on:mouseover={() => activeIndex = index }
          on:mouseout={() => activeIndex = null }
        />

        {#if data.length <= 50}
          <text
            class="ts-x-label"
            y={height + 20}
            x={xScale(slice.duration) / 2}>{index + 1}</text
          >
        {/if}
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
  .area-path {
    fill: #ccd3e2;
    shape-rendering: crispEdges;
  }
  rect.ts {
    fill: #ccd3e2;
    shape-rendering: crispEdges;
  }
  .selected .ts {
    fill: #885e5e;
  }
</style>
