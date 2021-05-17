<script>
  import { globalSettings } from "./stores/chartConfig";

  let widthValue = $globalSettings.width.default;
  let heightValue = $globalSettings.height.default;
  let showMissingData = $globalSettings.showMissingData.default;
  let showTooltipValue = $globalSettings.showTooltip.default;
  let showTimeline = $globalSettings.showTimeline.default;

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
    globalSettings.update((prev) => ({
      ...prev,
      showTooltip: {
        ...prev.showTooltip,
        selectedValue: showTooltipValue,
      },
    }));
  }
  $: {
    globalSettings.update((prev) => ({
      ...prev,
      showTimeline: {
        ...prev.showTimeline,
        selectedValue: showTimeline,
      },
    }));
  }
  $: {
    globalSettings.update((prev) => ({
      ...prev,
      showMissingData: {
        ...prev.showMissingData,
        selectedValue: showMissingData,
      },
    }));
  }
</script>

<div class="sidebar-block" id="global-chart-settings">
  <form class="uk-form-horizontal">
    <div class="uk-margin-small">
      <label class="uk-form-label" for="form-horizontal-text">Chart width</label
      >
      <div class="uk-form-controls">
        <div class="uk-grid-small" uk-grid>
          <div class="uk-width-1-2">
            <input
              type="number"
              bind:value={widthValue}
              min={$globalSettings.width.range[0]}
              max={$globalSettings.width.range[1]}
              class="uk-input uk-form-small number-input"
            />
          </div>
          <div class="uk-width-1-2">
            <input
              class="uk-range"
              type="range"
              min={$globalSettings.width.range[0]}
              max={$globalSettings.width.range[1]}
              bind:value={widthValue}
            />
          </div>
        </div>
      </div>
    </div>

    <div class="uk-margin-small">
      <label class="uk-form-label" for="form-horizontal-select"
        >Chart height</label
      >
      <div class="uk-form-controls">
        <div class="uk-grid-small" uk-grid>
          <div class="uk-width-1-2">
            <input
              type="number"
              bind:value={heightValue}
              min={$globalSettings.height.range[0]}
              max={$globalSettings.height.range[1]}
              class="uk-input uk-form-small number-input"
            />
          </div>
          <div class="uk-width-1-2">
            <input
              class="uk-range"
              type="range"
              min={$globalSettings.height.range[0]}
              max={$globalSettings.height.range[1]}
              bind:value={heightValue}
            />
          </div>
        </div>
      </div>
    </div>

    <div class="uk-margin-small">
      <div class="uk-form-label">Missing data</div>
      <div class="uk-form-controls uk-form-controls-text">
        <input
          class="uk-checkbox"
          type="checkbox"
          bind:checked={showMissingData}
        />
      </div>
    </div>

    <div class="uk-margin-small">
      <div class="uk-form-label">Timeline</div>
      <div class="uk-form-controls uk-form-controls-text">
        <input
          class="uk-checkbox"
          type="checkbox"
          bind:checked={showTimeline}
        />
      </div>
    </div>

    <div class="uk-margin-small">
      <div class="uk-form-label">Tooltips</div>
      <div class="uk-form-controls uk-form-controls-text">
        <input
          class="uk-checkbox"
          type="checkbox"
          bind:checked={showTooltipValue}
        />
      </div>
    </div>
  </form>
</div>

<style>
  p {
    display: inline-block;
  }
  .number-input {
    display: inline-block;
  }
  .uk-form-horizontal .uk-form-label {
    width: 92px;
  }
  .uk-form-horizontal .uk-form-controls {
    margin-left: 100px;
  }
  .uk-range {
    margin-top: 5px;
  }
</style>
