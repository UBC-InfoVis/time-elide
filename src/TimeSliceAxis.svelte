<script>
  import * as d3 from "d3";

  export let data;
  export let width;
  export let height;
  export let xScale;
  export let variableLabelWidth = false;
  export let zoomFactor = 1;
  export let zoomXScale;

  let formatWeekday = d3.timeFormat("%a");
  let formatDate = d3.timeFormat("%a, %b %e");

  let g;

  let axisLabels;
  $: {
    axisLabels = [];

    let labelWidth = 0;
    if (!variableLabelWidth) {
      labelWidth = xScale.step();
    }
    if (variableLabelWidth || labelWidth > 18) { // Show only labels if there is enough space
      data.forEach((slice, index) => {
        // Determine variable width of time slices if a linear x-scale is used
        if (variableLabelWidth) {
          labelWidth = zoomFactor * xScale(slice.duration);

          if (labelWidth <= 18) {
            return;
          }

          // Ignore and do not show labels that are outside of current zoom window
          if (
            zoomFactor > 1 
            && (slice.xPos < zoomXScale.domain()[0] || slice.duration > zoomXScale.domain()[1])
          ) {
            return;
          }
        }

        // Show more or less information depending on the available space
        let labelText = '';
        if (labelWidth < 28) { // Show 2-char weekday
          labelText = formatWeekday(slice.date).substring(0,2);
        } else if (labelWidth < 65) { // Show 3-char weekday
          labelText = formatWeekday(slice.date);
        } else {
          labelText = formatDate(slice.date);
        }

        // Position label in the center of each time slice
        let xPos = (variableLabelWidth) ? zoomXScale(slice.xPos) : xScale(slice.id);
        xPos = xPos + labelWidth/2;
        if (xPos > 0 && xPos < width) {
          axisLabels = [...axisLabels, { xPos: xPos, text: labelText }];
        }
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
  {#each axisLabels as label}
    <text text-anchor="middle" x={label.xPos} y=18px>
      {label.text}
    </text>
  {/each}
</g>
