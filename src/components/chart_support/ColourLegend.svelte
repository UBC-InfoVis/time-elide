<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  
  export let containerHeight = 45;
  export let containerWidth = 280;
  export let scale;
  export let title = "Value";
  export let margin = { top: 15, right: 30, bottom: 20, left: 50 };

  let svg, width, height, xScale;
  let labelHeight = 10;

  $: width = containerWidth - margin.left - margin.right;
  $: height = containerHeight - margin.top - margin.bottom;
  $: tickLineY = height + 5;
  $: tickLabelY = tickLineY + 3;

  $: xScale = d3.scaleLinear()
      .domain(scale.domain())
      .range([0, width]);

  // Define begin and end of the color gradient (legend)
  $: stops = [
    { color: scale(scale.domain()[0]), value: scale.domain[0], offset: 0},
    { color: scale(scale.domain()[1]), value: scale.domain[1], offset: 100},
  ];
  
  $: ticks = [
    scale.domain()[0],
    scale.domain()[1]/100*33.3,
    scale.domain()[1]/100*66.6,
    scale.domain()[1]
  ];
</script>


<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <defs>
    <linearGradient id="legend-gradient">
      {#each stops as stop}
        <stop offset="{stop.offset}%"  stop-color="{stop.color}" />
      {/each}
    </linearGradient>
  </defs>
  <text
    class="legend-title"
    x={margin.left}
    dy="0.71em"
  >
    {title}
  </text>
  <g transform="translate({margin.left},{margin.top})">
    <rect
      height={height}
      width={width}
      fill="url('#legend-gradient')"
    />
    {#each ticks as tick}
      <line
        x1={xScale(tick)}
        x2={xScale(tick)}
        y2={tickLineY}
        class="legend-tick-line"
      />
      <text
        x={xScale(tick)}
        y={tickLabelY}
        dy="0.71em"
        text-anchor="middle"
        class="legend-tick-label"
      >
        {Math.round(tick)}
      </text>
    {/each}
  </g>
</svg>

<style>
  .legend-tick-line {
    stroke: #333;
  }
  .legend-tick-label {
    font-size: .7rem;
  }
  .legend-title {
    font-size: .7rem;
    fill: #555;
  }
</style>