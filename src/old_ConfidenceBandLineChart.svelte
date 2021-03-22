<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { containerWidth, containerHeight } from "./stores";

  import Axis from "./Axis.svelte";

  export let data;

  // General chart settings
  const margin = { top: 20, right: 5, bottom: 30, left: 40 };

  let width, height, xScale, yScale;
  let svg;

  let nBins = 10;
  let binnedData = [], 
      aggregatedData = [];

  // Initialize global x- and y-scales
  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    
    height = $containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.maxValue)])
        .range([height, 0]);
  }

  $: if (data.length > 0) {
    // Used later to map absolute timestamps to bins
    let binSize = d3.max(data, d => d.duration)/nBins;
    console.log(binSize);

    data.forEach((slice) => {
      // // Temporary scale to map timestamps of current slice to a scale from 0-100
      // let tempTimeScale = d3.scaleLinear()
      //     .domain(d3.extent(slice.values, d => d.timestamp.getTime()))
      //     .range([0,100]);

      // // Add data points from current slice to raw binned data
      // slice.values.forEach((d) => {
      //   let bin = Math.max(0,(Math.floor(tempTimeScale(d.timestamp.getTime())/nBins)-1));
      //   binnedData[bin] = binnedData[bin] || [];
      //   binnedData[bin].push(d.value);
      // });
      
      // Add data points from current slice to raw binned data
      slice.values.forEach((d) => {
        let bin = (d.timestamp.getTime() - slice.values[0].timestamp.getTime()) / binSize;
        binnedData[bin] = binnedData[bin] || [];
        binnedData[bin].push(d.value);
      });
    });

    console.log(binnedData);

    // Aggregate data from bins
    binnedData.forEach((bin, index) => {
      bin.sort();
      let binStats = {
        xPos: (index)*nBins,
        minValue: d3.min(bin),
        maxValue: d3.max(bin),
        avgValue: d3.mean(bin),
        medianValue: d3.median(bin),
        lowerQuartileValue: d3.quantile(bin, 0.25),
        upperQuartileValue: d3.quantile(bin, 0.75)
      };
      aggregatedData.push(binStats);
    });
  }

  let lineGenerator = d3.line()
      .x((d) => xScale(d.xPos))
      .y((d) => yScale(d.avgValue));

  let iqrAreaGenerator = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.xPos))
      .y0((d) => yScale(d.lowerQuartileValue))
      .y1((d) => yScale(d.upperQuartileValue));

  let minMaxAreaGenerator = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.xPos))
      .y0((d) => yScale(d.minValue))
      .y1((d) => yScale(d.maxValue));
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    <path class="ts-min-max" d={minMaxAreaGenerator(aggregatedData)} />
    <path class="ts-iqr" d={iqrAreaGenerator(aggregatedData)} />
    <path class="ts-avg" d={lineGenerator(aggregatedData)} />

    <!-- Add axes -->
    <Axis {width} {height} scale={yScale} position="left" />
    <Axis {width} {height} scale={xScale} position="bottom" />
  </g>
</svg>

<style>
</style>
