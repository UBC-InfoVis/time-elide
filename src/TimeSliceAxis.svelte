<script>
  import * as d3 from "d3";

  export let data;
  export let width;
  export let height;
  export let labelWidth;

  let formatWeekday = d3.timeFormat("%a");

  let g;

  let axisLabels;
  $: {
    axisLabels = [];
    if (labelWidth > 8) { // Show only labels if there is enough space
      data.forEach((d,index) => {
        let label = '';
        if (labelWidth < 12) {
          if (index % 2 == 0) { // Show every second label (2-char weekday)
            label = formatWeekday(d.date).substring(0,2);
          } else {
            return;
          }
        } else if (labelWidth < 16) { // Show 2-char weekday
          label = formatWeekday(d.date).substring(0,2);
        } else if (labelWidth < 20) { // Show 3-char weekday
          label = formatWeekday(d.date);
        }
        axisLabels = [...axisLabels, label];
      });
    }
  }
  
</script>

<g class="axis ts-axis" bind:this={g} transform="translate(0, {height})">
  <line
    y1="1px"
    y2="1px"
    x2={width}
    class="gridline gridline-primary"
  />
  {#each axisLabels as label, index}
    <text
      text-anchor="middle"
      x={(index * labelWidth) + (labelWidth / 2)}
    >
      {label}
    </text>
  {/each}
</g>
