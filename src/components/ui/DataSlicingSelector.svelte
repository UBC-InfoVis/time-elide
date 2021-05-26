<script>
  import ManualSlicer from "./ManualSlicer.svelte";
  import AutomaticSlicer from "./AutomaticSlicer.svelte";
  import {
    dataSlicingSelection,
    validSlicingSelection,
    selectedVisType,
    dataSource,
    slicerErrorMessage,
    slicedData,
  } from "../../stores/ui";
  import {
    MANUAL_SELECT,
    DETECT_PERIODS,
    NONE_SELECTED,
  } from "../../default_values/constants";

  export let disabled;

  const handleManualSelectClick = () => {
    dataSlicingSelection.set(MANUAL_SELECT);
    slicerErrorMessage.set(undefined);
  };

  const handleDetectClick = () => {
    dataSlicingSelection.set(DETECT_PERIODS);
    validSlicingSelection.set(true);
    slicerErrorMessage.set(undefined);
  };

  const handleXClick = () => {
    dataSlicingSelection.set(NONE_SELECTED);
    validSlicingSelection.set(false);
    slicerErrorMessage.set(undefined);
    slicedData.set([]);
    // selectedVisType.set(undefined);
  };

  $: if ($dataSource !== undefined) {
    if ($dataSource.datasetType === "manual") {
      dataSlicingSelection.set(MANUAL_SELECT);
    } else if ($dataSource.datasetType === "automatic") {
      dataSlicingSelection.set(DETECT_PERIODS);
      validSlicingSelection.set(true);
    }
  }
</script>

<div class="sidebar-block" class:disabled>
  <h2>Select slicing method</h2>
  {#if $dataSlicingSelection === NONE_SELECTED}
    <button
      on:click={handleDetectClick}
      class="uk-button uk-button-default btn-lg"
      {disabled}
      ><div class="btn-subtitle">Option 1</div>
      <div class="btn-title">Automatically detect existing slices</div>
    </button>
    <button
      on:click={handleManualSelectClick}
      class="uk-button uk-button-default btn-lg"
      {disabled}
      ><div class="btn-subtitle">Option 2</div>
      <div class="btn-title">Manually specify desired slices</div>
    </button>
  {:else if $dataSlicingSelection === MANUAL_SELECT}
    <ManualSlicer {handleXClick} />
  {:else}
    <AutomaticSlicer {handleXClick} />
  {/if}
</div>

<style>
  .disabled {
    opacity: 0.4;
  }

  .btn-lg {
    height: 100px;
    width: 100%;
    text-align: left;
    padding: 0 20px;
  }
  .btn-lg:not(:last-child) {
    margin-bottom: 10px;
  }
  .btn-lg .btn-title {
    font-size: 1.4rem;
  }
  .btn-lg .btn-subtitle {
    transition: all 180ms ease-in-out;
    font-size: 0.875rem;
    color: #9fa2b4;
  }
  .btn-lg:hover .btn-subtitle {
    color: #3751ff;
  }
</style>
