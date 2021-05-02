<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  
  export let containerHeight = 110;
  export let containerWidth = 300;
  export let selectedLayers;
  export let colourScheme = "lines";
  export let margin = { top: 20, right: 5, bottom: 5, left: 5 };

  let svg, width, height, xScale, yScale, lineGenerator;

  let pathData = [
    { x: 0, y: 100 },
    { x: 10, y: 90 },
    { x: 20, y: 70 },
    { x: 30, y: 60 },
    { x: 40, y: 60 },
    { x: 50, y: 60 },
    { x: 60, y: 15 },
    { x: 70, y: 0 },
    { x: 80, y: 30 },
    { x: 90, y: 40 },
    { x: 100, y: 100 },
  ];

  $: width = containerWidth - margin.left - margin.right;
  $: height = containerHeight - margin.top - margin.bottom;
  $: labelWidth = 160;
  $: connectorWidth = 10;
  $: connectorPadding = 6;
  $: boxWidth = width - labelWidth - connectorPadding - connectorWidth;

  $: yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, height]);

  $: xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, boxWidth]);

  $: lineGenerator = d3.line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

</script>


<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">

    {#if selectedLayers.includes("min-max")}
      <g transform="translate({boxWidth},{yScale(9)})">
        <line
          x2={connectorWidth}
          class="legend-connector"
        />
        <text
          class="legend-label"
          dy="0.35em"
          x={connectorWidth+connectorPadding}  
        >
          Min-max range
        </text>
      </g>
      <rect
        height={height}
        width={boxWidth}
        class="ts-min-max {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
      />
    {/if}

    {#if selectedLayers.includes("quartiles")}
      <g transform="translate({boxWidth},{yScale(30)})">
        <line
          x2={connectorWidth}
          class="legend-connector"
        />
        <text
          class="legend-label"
          dy="0.35em"
          x={connectorWidth+connectorPadding}  
        >
          Upper and lower quartiles
        </text>
      </g>
      <rect
        y={yScale(25)}
        height={yScale(50)}
        width={boxWidth}
        class="ts-iqr {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
      />
    {/if}

    {#if selectedLayers.includes("median") || selectedLayers.includes("average")}
      <g transform="translate({boxWidth},{yScale(50)})">
        <line
          x2={connectorWidth}
          class="legend-connector"
        />
        <text
          class="legend-label"
          dy="0.35em"
          x={connectorWidth+connectorPadding}
        >
          {#if selectedLayers.includes("median") && selectedLayers.includes("average")}
            Median/average
          {:else if selectedLayers.includes("median")}
            Median
          {:else}
            Average
          {/if}
        </text>
      </g>
      <line
        class="ts-median {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        x2={boxWidth}
        y1={yScale(50)}
        y2={yScale(50)}
      />
    {/if}

    {#if selectedLayers.includes("raw data")}
      <g transform="translate({boxWidth},{yScale(70)})">
        <line
          x1={-xScale(5)}
          x2={connectorWidth}
          class="legend-connector"
        />
        <text
          class="legend-label"
          dy="0.35em"
          x={connectorWidth+connectorPadding}
        >
          Raw data
        </text>
      </g>
      <path
        class="ts-avg {colourScheme === 'lines'
          ? 'colour-scheme-lines'
          : 'colour-scheme-boxes'}"
        d={lineGenerator(pathData)}
      />
    {/if}
  </g>
</svg>

<style>
  .legend-connector {
    stroke: #ccc;
  }
  .legend-label {
    font-size: .7rem;
    fill: #555;
  }
</style>