<script>
  import ManualSlicer from "./ManualSlicer.svelte";
  import AutomaticSlicer from "./AutomaticSlicer.svelte";

  export let disabled;
  const MANUAL_SELECT = "manual select";
  const DETECT_PERIODS = "detect periods";
  const NONE_SELECTED = "none selected";
  let slicerMode = NONE_SELECTED;

  const handleManualSelectClick = () => {
    slicerMode = MANUAL_SELECT;
  };

  const handleDetectClick = () => {
    slicerMode = DETECT_PERIODS;
  };

  $: if (disabled) {
    slicerMode = NONE_SELECTED;
  }
</script>

<div class="sidebar-block" class:disabled>
  <h2>Select slicing method</h2>
  {#if slicerMode === NONE_SELECTED}
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
  {:else if slicerMode === MANUAL_SELECT}
    <ManualSlicer />
  {:else}
    <AutomaticSlicer />
  {/if}
</div>

<style>
  .disabled {
    opacity: 0.6;
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
    font-size: .875rem;
    color: #9FA2B4;
  }
  .btn-lg:hover .btn-subtitle {
    color: #3751FF;
  }
</style>
