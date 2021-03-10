<script>
  import { scaleLinear, scaleSequential } from "d3-scale";
  import { extent } from "d3-array";
  import { interpolateBlues } from "d3-scale-chromatic";
  import { onMount } from "svelte";

  import { containerWidth, containerHeight } from "./stores";

  export let data;

  const dataKey = "avgValue";

  const margin = { top: 0, right: 5, bottom: 40, left: 5 };

  let width, xScale;
  let svg;

  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = scaleLinear();
  }

  $: colorScale = scaleSequential()
    .domain(extent(data, (d) => d[dataKey]))
    .interpolator(interpolateBlues);

  $: {
    let xExtent = extent(data, (d) => d.xPos);
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
  }
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    {#each data as slice}
      <rect
        x={xScale(slice.xPos)}
        width={xScale(slice.duration)}
        fill={colorScale(slice[dataKey])}
        height={$containerHeight}
      />
    {/each}
  </g>
</svg>

<style>
</style>
