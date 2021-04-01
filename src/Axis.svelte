<script>
  // see https://github.com/TomFevrier/svelte-d3-demo/blob/master/src/Axis.svelte
  import { onMount } from "svelte";
  import { select, selectAll } from "d3-selection";
  import { axisBottom, axisLeft } from "d3-axis";

  export let width;
  export let height;
  export let ticks;
  export let tickFormat;
  export let tickValues;
  export let position;
  export let scale;
  export let transform;
  let g;

  $: {
    select(g).selectAll("*").remove();

    let axis;
    switch (position) {
      case "bottom":
        axis = axisBottom(scale).tickSizeOuter(0);
        transform = `translate(0, ${height})`;
        break;
      case "left":
        axis = axisLeft(scale).tickSizeOuter(0);
    }

    if (tickFormat) {
      axis.tickFormat(tickFormat);
    }

    if (ticks) {
      axis.ticks(ticks);
    }

    if (tickValues) {
      axis.tickValues(tickValues);
    }

    select(g).call(axis);
  }
</script>

<g class="axis" bind:this={g} {transform} />
