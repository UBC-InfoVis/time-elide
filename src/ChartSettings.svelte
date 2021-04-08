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
  let selectedLayersSparkboxes =
    $chartSpecificSettings.sparkboxes.layers.default;
  let selectedLayersConfidenceBand =
    $chartSpecificSettings.confidenceBandLineChart.layers.default;

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
  function handleLayerSelect(event) {
    // {#if $selectedVisType.key === "sparkboxes"}
    //     <Sparkboxes data={d3data} />
    //   {:else if $selectedVisType.key === "stepped-area-chart"}
    //     <SteppedAreaChart data={d3data} />
    //   {:else if $selectedVisType.key === "colour-heatmap"}
    //     <ColorHeatmap data={d3data} />
    //   {:else if $selectedVisType.key === "dotplot-heatmap"}
    //     <DotHeatmap data={d3data} />
    //   {:else if $selectedVisType.key === "multi-series-line-chart"}
    //     <MultiSeriesLineChart data={d3data} />
    //   {:else if $selectedVisType.key === "confidence-band-line-chart"}
    //     <ConfidenceBandLineChart data={d3data} />
    //   {/if}
    const selectedLayers = [];
    event.detail.forEach((layer) => selectedLayers.push(layer.value));
    switch ($selectedVisType.key) {
      case "sparkboxes":
        chartSpecificSettings.update((prev) => ({
          ...prev,
          sparkboxes: {
            ...prev.sparkboxes,
            layers: {
              ...prev.sparkboxes.layers,
              selectedValue: selectedLayers,
            },
          },
        }));
        break;
      case "confidenceBandLineChart":
        chartSpecificSettings.update((prev) => ({
          ...prev,
          confidenceBandLineChart: {
            ...prev.confidenceBandLineChart,
            layers: {
              ...prev.confidenceBandLineChart.layers,
              selectedValue: selectedLayers,
            },
          },
        }));
      default:
        break;
    }
  }
</script>

{#if $selectedVisType}
  <div id="chart-settings">
    <h3>Chart settings</h3>

    <form id="chart-settings-form">
      {#if layersTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Layers:</p>
          <Select
            items={layersOptions}
            selectedValue={$selectedVisType.key === "sparkboxes"
              ? selectedLayersSparkboxes
              : selectedLayersConfidenceBand}
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
          <select class="uk-select">
            <option />
          </select>
        </div>
      {/if}
      {#if normalizeSliceWidthsTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Normalize slice widths:</p>
          <input class="uk-checkbox" type="checkbox" />
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
          <p>x-scale mode:</p>
          <!-- svelte-ignore a11y-no-onchange -->
          <select class="uk-select" bind:value={settingVars.xScaleMode}>
            {#each $chartSpecificSettings[$selectedVisType.key].xScaleMode.options as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if binsTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Bins:</p>
          <input type="number" min={1} max={50} class="number-input" />
        </div>
      {/if}
      {#if aggregationTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>Aggregation:</p>
          <select class="uk-select" bind:value={settingVars.aggregation}>
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
    width: 120px;
  }
</style>
