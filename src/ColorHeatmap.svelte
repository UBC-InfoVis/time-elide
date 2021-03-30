<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  import { containerWidth, containerHeight } from "./stores";

  import Timeline from "./Timeline.svelte";

  export let data;

  const dataKey = "avgValue";

  const margin = { top: 0, right: 5, bottom: 40, left: 5 };
  const timelineMargin = { top: 20, right: 5, bottom: 30, left: 5 };

  let width, xScale;
  let svg;

  // Store selected time slice
  let activeIndex;

  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = d3.scaleLinear();
  }

  $: colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d[dataKey]))
    .interpolator(d3.interpolateBlues);

  $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
  }
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    {#each data as slice, index}
      <rect
        x={xScale(slice.xPos)}
        width={xScale(slice.duration)}
        fill={colorScale(slice[dataKey])}
        height={$containerHeight}
        on:mouseover={() => (activeIndex = index)}
        on:mouseout={() => (activeIndex = null)}
      />
    {/each}
  </g>
</svg>

<Timeline {data} bind:activeIndex margin={timelineMargin} />

<style>
  rect {
    shape-rendering: crispEdges;
  }
</style>
