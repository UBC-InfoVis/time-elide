<script>
  import { globalSettings } from "./stores";

  let widthValue = $globalSettings.width.default;
  let heightValue = $globalSettings.height.default;
  let showTooltipValue = $globalSettings.showTooltip.default;

  $: if (widthValue) {
    globalSettings.update((prev) => ({
      ...prev,
      width: {
        ...prev.width,
        selectedValue: widthValue,
      },
    }));
  }
  $: if (heightValue) {
    globalSettings.update((prev) => ({
      ...prev,
      height: {
        ...prev.height,
        selectedValue: heightValue,
      },
    }));
  }
  $: {
    console.log("tooltip checkbox changed to: ", showTooltipValue); // doesn't update when unchecked?
    globalSettings.update((prev) => ({
      ...prev,
      showTooltip: {
        ...prev.showTooltip,
        selectedValue: showTooltipValue,
      },
    }));
  }
</script>

<div class="sidebar-block" id="global-chart-settings">
  <h3>Global chart settings</h3>

  <form>
    <p>Width:</p>
    <input
      type="number"
      bind:value={widthValue}
      min={$globalSettings.width.range[0]}
      max={$globalSettings.width.range[1]}
      class="number-input"
    />
    <input
      class="uk-range"
      type="range"
      min={$globalSettings.width.range[0]}
      max={$globalSettings.width.range[1]}
      bind:value={widthValue}
    />
    <p>Height:</p>
    <input
      type="number"
      bind:value={heightValue}
      min={$globalSettings.height.range[0]}
      max={$globalSettings.height.range[1]}
      class="number-input"
    />
    <input
      class="uk-range"
      type="range"
      min={$globalSettings.height.range[0]}
      max={$globalSettings.height.range[1]}
      bind:value={heightValue}
    />
    <p>Show Tooltip:</p>
    <input class="uk-checkbox" type="checkbox" bind:value={showTooltipValue} />
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
