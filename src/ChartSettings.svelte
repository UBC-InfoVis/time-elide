<script>
  import Select from "svelte-select";
  import { selectedVisType, chartSpecificSettings } from "./stores";

  const settingKeys = new Set();
  const createSettingsVarArray = () => {
    for (const [visType, settings] of Object.entries($chartSpecificSettings)) {
      const keys = Object.keys(settings);
      keys.forEach((key) => settingKeys.add(key));
    }
  };

  createSettingsVarArray();

  let layersOptions;

  const settingVars = {}; // hold local setting variables here

  settingKeys.forEach((setting) => {
    if ($chartSpecificSettings[$selectedVisType.key].hasOwnProperty(setting)) {
      settingVars[setting] =
        $chartSpecificSettings[$selectedVisType.key][setting].default;
    }
  });

  // whenever selectedVisType.key changes, update showTimeline (for instance) to the appropriate store value
  $: if ($selectedVisType.key) {
    settingKeys.forEach((setting) => {
      updateFromStore($selectedVisType.key, setting); // do this programmatically?
    });
  }

  // update the local setting var, held in settingVars, to the selectedValue in the store for that particular vis
  const updateFromStore = (visType, property) => {
    // check if that vis type has that property (setting) to begin with before setting anything
    if ($chartSpecificSettings[visType].hasOwnProperty(property)) {
      settingVars[property] =
        $chartSpecificSettings[visType][property].selectedValue;
    }
  };

  // Define which vis types allow for which chart settings
  const visTypes = Object.entries($chartSpecificSettings);
  const layersTypes = [],
    xScaleModeTypes = [],
    showTimelineTypes = [],
    colourSchemeTypes = [],
    normalizeSliceWidthsTypes = [],
    lineOpacityTypes = [],
    binsTypes = [],
    aggregationTypes = [];
  visTypes.forEach((type) => {
    // do this programmatically with settingKeys
    if (type[1].hasOwnProperty("layers")) layersTypes.push(type[0]);
    if (type[1].hasOwnProperty("xScaleMode")) xScaleModeTypes.push(type[0]);
    if (type[1].hasOwnProperty("showTimeline")) showTimelineTypes.push(type[0]);
    if (type[1].hasOwnProperty("colourScheme")) colourSchemeTypes.push(type[0]);
    if (type[1].hasOwnProperty("normalizeSliceWidths"))
      normalizeSliceWidthsTypes.push(type[0]);
    if (type[1].hasOwnProperty("lineOpacity")) lineOpacityTypes.push(type[0]);
    if (type[1].hasOwnProperty("bins")) binsTypes.push(type[0]);
    if (type[1].hasOwnProperty("aggregation")) aggregationTypes.push(type[0]);
  });

  // Reset layers <select> options based on selected vis type
  // TODO: do this programmatically
  $: if ($selectedVisType.key === "sparkboxes") {
    layersOptions = $chartSpecificSettings.sparkboxes.layers.options;
  } else if ($selectedVisType.key === "confidenceBandLineChart") {
    layersOptions =
      $chartSpecificSettings.confidenceBandLineChart.layers.options;
  }

  $: if (settingVars.showTimeline !== null) {
    updateStoreValue($selectedVisType.key, "showTimeline");
  }

  $: if (settingVars.xScaleMode) {
    updateStoreValue($selectedVisType.key, "xScaleMode");
  }

  $: if (settingVars.lineOpacity) {
    updateStoreValue($selectedVisType.key, "lineOpacity");
  }

  $: if (settingVars.aggregation) {
    updateStoreValue($selectedVisType.key, "aggregation");
  }

  $: if (settingVars.normalizeSliceWidthsTypes !== null) {
    updateStoreValue($selectedVisType.key, "normalizeSliceWidths");
  }

  $: if (settingVars.bins) {
    updateStoreValue($selectedVisType.key, "bins");
  }

  $: if (settingVars.colourScheme) {
    updateStoreValue($selectedVisType.key, "colourScheme");
  }

  const updateStoreValue = (visType, setting) => {
    chartSpecificSettings.update((prev) => ({
      ...prev,
      [visType]: {
        ...prev[visType],
        [setting]: {
          ...prev[visType][setting],
          selectedValue: settingVars[setting],
        },
      },
    }));
  };
  const handleLayerSelect = (event) => {
    const selectedLayers = [];
    if (event.detail && event.detail.length > 0) {
      event.detail.forEach((layer) => selectedLayers.push(layer.value));
    }
    settingVars.layers = selectedLayers;
    updateStoreValue($selectedVisType.key, "layers");
  };
</script>

{#if $selectedVisType}
  <div id="chart-settings">
    <form id="chart-settings-form">
      {#if layersTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Layers:</p>
          <Select
            items={layersOptions}
            selectedValue={settingVars.layers}
            isClearable={settingVars.layers.length > 1}
            on:select={handleLayerSelect}
            isMulti={true}
          />
        </div>
      {/if}
      {#if showTimelineTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Show timeline:</p>
          <input
            class="uk-checkbox"
            type="checkbox"
            bind:checked={settingVars.showTimeline}
          />
        </div>
      {/if}
      {#if colourSchemeTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Colour scheme:</p>
          <select class="uk-select uk-form-small select-sm" bind:value={settingVars.colourScheme}>
            {#each $chartSpecificSettings[$selectedVisType.key].colourScheme.options as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if normalizeSliceWidthsTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Normalize slice widths:</p>
          <input
            class="uk-checkbox"
            type="checkbox"
            bind:checked={settingVars.normalizeSliceWidths}
          />
        </div>
      {/if}
      {#if lineOpacityTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Line opacity:</p>
          <input
            type="number"
            min={$chartSpecificSettings[$selectedVisType.key].lineOpacity
              .range[0]}
            max={$chartSpecificSettings[$selectedVisType.key].lineOpacity
              .range[1]}
            step="0.1"
            class="number-input"
            bind:value={settingVars.lineOpacity}
          />
          <input
            class="uk-range"
            type="range"
            min={$chartSpecificSettings[$selectedVisType.key].lineOpacity
              .range[0]}
            max={$chartSpecificSettings[$selectedVisType.key].lineOpacity
              .range[1]}
            step="0.1"
            bind:value={settingVars.lineOpacity}
          />
        </div>
      {/if}
      {#if xScaleModeTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>
            {$selectedVisType.key === "dotHeatmap"
              ? "y-scale mode:"
              : "x-scale mode:"}
          </p>
          <!-- svelte-ignore a11y-no-onchange -->
          <select class="uk-select uk-form-small select-lg" bind:value={settingVars.xScaleMode}>
            {#each $chartSpecificSettings[$selectedVisType.key].xScaleMode.options as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if binsTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Bins:</p>
          <input
            type="number"
            min={$chartSpecificSettings[$selectedVisType.key].bins.range[0]}
            max={$chartSpecificSettings[$selectedVisType.key].bins.range[1]}
            class="number-input"
            bind:value={settingVars.bins}
          />
          <input
            class="uk-range uk-form-width-small uk-margin-right"
            type="range"
            min={$chartSpecificSettings[$selectedVisType.key].bins.range[0]}
            max={$chartSpecificSettings[$selectedVisType.key].bins.range[1]}
            width="200"
            bind:value={settingVars.bins}
          />
        </div>
      {/if}
      {#if aggregationTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Aggregation:</p>
          <select class="uk-select uk-form-small select-sm" bind:value={settingVars.aggregation}>
            {#each $chartSpecificSettings[$selectedVisType.key].aggregation.options as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
      {/if}
    </form>
  </div>
{/if}

<style>
  #chart-settings-form {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;
    background-color: #ebf2f7;
    font-size: .875rem;
  }
  .setting {
    margin: 10px;
  }
  .setting p {
    display: inline-block;
  }
  .setting input {
    display: inline-block;
  }

  .uk-select {
    width: 175px;
  }
  .select-sm {
    width: 85px;
  }
  .select-lg {
    width: 175px;
  }
  :global(.multiSelect) {
    --borderRadius: 4px;
    --multiItemBorderRadius: 4px;
    --multiSelectPadding: 0 25px 0 2px;
    --height: 28px;
    --multiItemMargin: 2px 4px 0 0;
    --multiItemHeight: 24px;
    --multiItemHeight: 24px;
    --multiItemPadding: 0 8px;
    --multiClearTop: 5px;
    --multiClearWidth: 12px;
    --multiClearWidth: 12px;
    --multiClearHeight: 12px;
    --clearSelectTop: 2px;
    --clearSelectRight: 2px;
    max-width: 290px;
    font-size: .8rem;
  }
  :global(.multiSelect input) {
    flex: 1 1 5px;
  }
</style>
