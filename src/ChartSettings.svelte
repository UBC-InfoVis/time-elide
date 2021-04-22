<script>
  import Select from "svelte-select";
  import GlobalChartSettings from "./GlobalChartSettings.svelte";
  import { selectedVisType, chartSpecificSettings } from "./stores";

  const handleLayerSelect = (event) => {
    const selectedLayers = [];
    if (event.detail && event.detail.length > 0) {
      event.detail.forEach((layer) => selectedLayers.push(layer.value));
    }
    $chartSpecificSettings[$selectedVisType.key].layers.selectedValue = selectedLayers;
  };

</script>

{#if $selectedVisType}
  <div id="chart-settings">
    <form id="chart-settings-form">
      <div class="setting">
        <button class="uk-button uk-button-default uk-button-small additional-settings-btn" type="button">General settings</button>
        <div class="uk-dropdown global-settings" uk-dropdown="mode: click; pos: bottom-left; offset: 0">
          <GlobalChartSettings />
        </div>
      </div>

      <div class="setting">
        <button class="uk-button uk-button-default uk-button-small additional-settings-btn" type="button">Chart-specific settings</button>
        <div class="uk-dropdown chart-specific-settings" uk-dropdown="mode: click; pos: bottom-left; offset: 0">
          <form class="uk-form-horizontal">

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("layers") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">Layers</label>
                <div class="uk-form-controls">
                  <Select
                    items={$chartSpecificSettings[$selectedVisType.key].layers.options}
                    selectedValue={$chartSpecificSettings[$selectedVisType.key].layers.selectedValue}
                    isClearable={$chartSpecificSettings[$selectedVisType.key].layers.selectedValue.length > 1}
                    on:select={handleLayerSelect}
                    isMulti={true}
                  />
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("colourScheme") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">Colour scheme</label>
                <div class="uk-form-controls">
                  <select 
                    class="uk-select uk-form-small"
                    bind:value={$chartSpecificSettings[$selectedVisType.key].colourScheme.selectedValue}
                  >
                    {#each $chartSpecificSettings[$selectedVisType.key].colourScheme.options as option}
                      <option value={option}>emphasize {option}</option>
                    {/each}
                  </select>
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("normalizeSliceWidths") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">Normalize slice widths</label>
                <div class="uk-form-controls">
                  <input
                    class="uk-checkbox"
                    type="checkbox"
                    bind:checked={$chartSpecificSettings[$selectedVisType.key].normalizeSliceWidths.selectedValue}
                  />
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("lineOpacity") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">Line opacity</label>
                <div class="uk-form-controls">
                  <input
                    type="number"
                    min={$chartSpecificSettings[$selectedVisType.key].lineOpacity
                      .range[0]}
                    max={$chartSpecificSettings[$selectedVisType.key].lineOpacity
                      .range[1]}
                    step="0.1"
                    class="uk-input uk-form-small input-xsm number-input"
                    bind:value={$chartSpecificSettings[$selectedVisType.key].lineOpacity.selectedValue}
                  />
                  <input
                    class="uk-range input-xsm"
                    type="range"
                    min={$chartSpecificSettings[$selectedVisType.key].lineOpacity
                      .range[0]}
                    max={$chartSpecificSettings[$selectedVisType.key].lineOpacity
                      .range[1]}
                    step="0.1"
                    bind:value={$chartSpecificSettings[$selectedVisType.key].lineOpacity.selectedValue}
                  />
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("xScaleMode") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">
                  {$selectedVisType.key === "heatmap"
                    ? "Y-scale mode"
                    : "X-scale mode"}
                </label>
                <div class="uk-form-controls">
                  <select 
                    class="uk-select uk-form-small" 
                    bind:value={$chartSpecificSettings[$selectedVisType.key].xScaleMode.selectedValue}
                  >
                    {#each $chartSpecificSettings[$selectedVisType.key].xScaleMode.options as option}
                      <option value={option}>{option}</option>
                    {/each}
                  </select>
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("aggregation") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">Aggregation</label>
                <div class="uk-form-controls">
                  <select 
                    class="uk-select uk-form-small" 
                    bind:value={$chartSpecificSettings[$selectedVisType.key].aggregation.selectedValue}
                  >
                    {#each $chartSpecificSettings[$selectedVisType.key].aggregation.options as option}
                      <option value={option}>{option}</option>
                    {/each}
                  </select>
                </div>
              </div>
            {/if}

            {#if $chartSpecificSettings[$selectedVisType.key].hasOwnProperty("bins") }
              <div class="uk-margin-small">
                <label class="uk-form-label" for="form-horizontal-text">
                  {$selectedVisType.key === "heatmap"
                    ? "Vertical bins"
                    : "Horziontal bins"}
                </label>
                <div class="uk-form-controls">
                  <input
                    type="number"
                    min={$chartSpecificSettings[$selectedVisType.key].bins.range[0]}
                    max={$chartSpecificSettings[$selectedVisType.key].bins.range[1]}
                    class="uk-input uk-form-small input-xsm number-input"
                    bind:value={$chartSpecificSettings[$selectedVisType.key].bins.selectedValue}
                  />
                  <input
                    class="uk-range input-xsm"
                    type="range"
                    min={$chartSpecificSettings[$selectedVisType.key].bins.range[0]}
                    max={$chartSpecificSettings[$selectedVisType.key].bins.range[1]}
                    width="200"
                    bind:value={$chartSpecificSettings[$selectedVisType.key].bins.selectedValue}
                  />
                  <span class="bin-duration">
                    {#if $chartSpecificSettings[$selectedVisType.key].bins.binDuration }
                      (bin duration = {$chartSpecificSettings[$selectedVisType.key].bins.binDuration} minutes)
                    {:else}
                      (variable bin duration)
                    {/if}
                  </span>
                </div>
              </div>
            {/if}

        </div>
      </div>
    </form>
  </div>
{/if}

<style>
  #chart-settings {
    margin-bottom: 20px;
  }
  #chart-settings-form {
    display: flex;
    flex-wrap: wrap;
    font-size: .875rem;
  }
  .setting {
    margin-right: 20px;
    margin-bottom: 10px;
  }
  .setting:last-child {
    margin-right: 0;
  }
  .setting input {
    display: inline-block;
  }

  .uk-dropdown {
    padding: 10px;
  }
  .additional-settings-btn {
    text-transform: none;
    border-radius: 4px;
  }
  .chart-specific-settings {
    min-width: 380px;
  }
  .chart-specific-settings .uk-form-horizontal .uk-form-label {
    margin-top: 0;
    width: 160px;
  }
  .chart-specific-settings .uk-form-horizontal .uk-form-controls {
    margin-left: 170px;
  }
  .bin-duration {
    fill: #888;
    font-size: .7rem;
  }

  .input-xsm {
    width: 60px;
  }
  :global(.multiSelect) {
    --borderRadius: 4px;
    --multiItemBorderRadius: 4px;
    --multiSelectPadding: 0 22px 0 2px;
    --height: 23px;
    --multiItemMargin: 2px 4px 0 0;
    --multiItemHeight: 18px;
    --multiItemHeight: 18px;
    --multiItemPadding: 0 5px;
    --multiItemBG: #ebf2f7;
    --multiItemActiveBG: #1e87f0;
    --multiClearTop: 4px;
    --multiClearWidth: 8px;
    --multiClearHeight: 8px;
    --multiClearBG: #b2bdc5;
    --clearSelectTop: 2px;
    --clearSelectRight: 2px;
    max-width: 290px;
    font-size: .8rem;
  }
  :global(.multiSelect>input) {
    flex: 1 1 5px!important;
  }
  :global(.multiSelectItem) {
    transition: all 200ms ease-in-out;
  }
</style>
