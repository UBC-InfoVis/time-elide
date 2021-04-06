<script>
  import Select from "svelte-select";
  import { selectedVisType, chartSpecificSettings } from "./stores";

  let layersOptions = $chartSpecificSettings.sparkboxes.layers.options;

  let selectedValue = $chartSpecificSettings.sparkboxes.layers.default;

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
      default:
        break;
    }
  }
</script>

{#if $selectedVisType}
  <div id="chart-settings">
    <h3>Chart settings</h3>

    <form id="chart-settings-form">
      <div class="setting">
        <p>Layers:</p>
        <Select
          items={layersOptions}
          {selectedValue}
          on:select={handleLayerSelect}
          isMulti={true}
        />
      </div>
      <div class="setting">
        <p>Show timeline:</p>
        <input class="uk-checkbox" type="checkbox" />
      </div>
      <div class="setting">
        <p>Colour scheme:</p>
        <input class="uk-select" type="select" />
      </div>
      <div class="setting">
        <p>Normalize slice widths:</p>
        <input class="uk-checkbox" type="checkbox" />
      </div>
      <div class="setting">
        <p>Line opacity:</p>
        <input type="number" min={0} max={100} class="number-input" />
        <input class="uk-range" type="range" min={0} max={100} />
      </div>
      <div class="setting">
        <p>x-scale mode:</p>
        <input class="uk-select" type="select" />
      </div>
      <div class="setting">
        <p>Bins:</p>
        <input type="number" min={1} max={50} class="number-input" />
      </div>
      <div class="setting">
        <p>Aggregation:</p>
        <input class="uk-select" type="select" />
      </div>
    </form>
  </div>
{/if}

<style>
  #chart-settings-form {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;
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
    width: 150px;
  }
</style>
