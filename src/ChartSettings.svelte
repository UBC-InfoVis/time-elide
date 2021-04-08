<script>
  import Select from "svelte-select";
  import { selectedVisType, chartSpecificSettings } from "./stores";

  let layersOptions;
  let selectedLayersSparkboxes =
    $chartSpecificSettings.sparkboxes.layers.default;
  let selectedLayersConfidenceBand =
    $chartSpecificSettings.confidenceBandLineChart.layers.default;
  let xScaleModeOptions =
    $chartSpecificSettings.multiSeriesLineChart.xScaleMode.options;
  let selectedXScaleMode =
    $chartSpecificSettings.multiSeriesLineChart.xScaleMode.default;
  let showTimeline = $chartSpecificSettings.sparkboxes.showTimeline.default;

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

  console.log(layersTypes);
  // Reset layers <select> options based on selected vis type
  $: if ($selectedVisType.key === "sparkboxes") {
    layersOptions = $chartSpecificSettings.sparkboxes.layers.options;
  } else if ($selectedVisType.key === "confidenceBandLineChart") {
    layersOptions =
      $chartSpecificSettings.confidenceBandLineChart.layers.options;
  }

  // $: if (showTimeline) {
  //   // update showTimeline for appropriate vis type
  //   chartSpecificSettings.update((prev) => ({
  //     ...prev,
  //     `${selectedVisType.key}`: {
  //       ...prev
  //     }
  //   }))
  // }

  $: if (selectedXScaleMode) {
    switch ($selectedVisType.key) {
      case "multiSeriesLineChart":
        chartSpecificSettings.update((prev) => ({
          ...prev,
          multiSeriesLineChart: {
            ...prev.multiSeriesLineChart,
            xScaleMode: {
              ...prev.multiSeriesLineChart.xScaleMode,
              selectedValue: selectedXScaleMode,
            },
          },
        }));
    }
  }
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
          <input class="uk-checkbox" type="checkbox" />
          <!-- add bind:checked={} back in -->
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
          <input type="number" min={0} max={100} class="number-input" />
          <input class="uk-range" type="range" min={0} max={100} />
        </div>
      {/if}
      {#if xScaleModeTypes.includes($selectedVisType.key)}
        <div class="setting">
          <p>x-scale mode:</p>
          <!-- svelte-ignore a11y-no-onchange -->
          <select class="uk-select" bind:value={selectedXScaleMode}>
            {#each xScaleModeOptions as option}
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
          <input class="uk-select" type="select" />
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
