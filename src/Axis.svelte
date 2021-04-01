<script>
  // see https://github.com/TomFevrier/svelte-d3-demo/blob/master/src/Axis.svelte
  import { onMount } from 'svelte';
  import { select, selectAll } from 'd3-selection';
  import { axisBottom, axisLeft } from 'd3-axis';
  
  export let width;
  export let height;
  export let ticks = undefined;
  export let tickFormat = undefined;
  export let position;
  export let scale;
  export let showGridLines = false;
  
  let transform;
  let g;
  
  $: {
    select(g).selectAll('*').remove();
    
    let axis;
    switch(position) {
      case 'bottom':
        axis = axisBottom(scale).tickSizeOuter(0);
        transform = `translate(0, ${height})`;
        if (showGridLines) {
          axis.tickSize(-height)
        }
        break;
      case 'left':
        axis = axisLeft(scale).tickSizeOuter(0);
        if (showGridLines) {
          axis.tickSize(-width)
        }
    }

    if (tickFormat) {
      axis.tickFormat(tickFormat);
    }

    if (ticks) {
      axis.ticks(ticks);
    }

    select(g).call(axis);
  }
</script>

<g class='axis' bind:this={g} {transform} />