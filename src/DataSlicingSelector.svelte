<script>
  import ManualSlicer from "./ManualSlicer.svelte";
  import AutomaticSlicer from "./AutomaticSlicer.svelte";
  import { dataSlicingSelection, validSlicingSelection } from "./stores";

  export let disabled;
  const MANUAL_SELECT = "manual select";
  const DETECT_PERIODS = "detect periods";
  const NONE_SELECTED = "none selected";
  // TODO: put this in a const file?

  const handleManualSelectClick = () => {
    dataSlicingSelection.set("manual select");
  };

  const handleDetectClick = () => {
    dataSlicingSelection.set("detect periods");
    validSlicingSelection.set(true);
  };

  const handleXClick = () => {
    dataSlicingSelection.set("none selected");
    validSlicingSelection.set(false);
  };
</script>

<div class="sidebar-block" class:disabled>
  <h2>Select slicing method</h2>
  {#if $dataSlicingSelection === NONE_SELECTED}
    <button
      on:click={handleManualSelectClick}
      class="uk-button uk-button-default btn-lg"
      {disabled}
      ><div class="btn-subtitle">Option 1</div>
      <div class="btn-title">Select periods manually</div>
    </button>
    <button
      on:click={handleDetectClick}
      class="uk-button uk-button-default btn-lg"
      {disabled}
      ><div class="btn-subtitle">Option 2</div>
      <div class="btn-title">Detect periods automatically</div>
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
