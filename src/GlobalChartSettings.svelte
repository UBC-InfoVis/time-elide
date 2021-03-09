<script>
  import { containerWidth, containerHeight } from "./stores";

  const MIN_CHART_WIDTH = 400;
  const MAX_CHART_WIDTH = 1200;
  const MIN_CHART_HEIGHT = 250;
  const MAX_CHART_HEIGHT = 1000;

  let widthValue = 1000;
  let heightValue = 400;

  $: if (widthValue) {
    containerWidth.set(widthValue);
  }
  $: if (heightValue) {
    containerHeight.set(heightValue);
  }
</script>

<div id="global-chart-settings">
  <h3>Global chart settings</h3>

  <form>
    <p>Width:</p>
    <input
      type="number"
      bind:value={widthValue}
      min={MIN_CHART_WIDTH}
      max={MAX_CHART_WIDTH}
      class="number-input"
    />
    <input
      class="uk-range"
      type="range"
      min={MIN_CHART_WIDTH}
      max={MAX_CHART_WIDTH}
      bind:value={widthValue}
    />
    <p>Height:</p>
    <input
      type="number"
      bind:value={heightValue}
      min={MIN_CHART_HEIGHT}
      max={MAX_CHART_HEIGHT}
      class="number-input"
    />
    <input
      class="uk-range"
      type="range"
      min={MIN_CHART_HEIGHT}
      max={MAX_CHART_HEIGHT}
      bind:value={heightValue}
    />
  </form>
</div>

<style>
  p {
    display: inline-block;
  }
  .number-input {
    display: inline-block;
  }
</style>
