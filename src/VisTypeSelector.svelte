<script>
  import VisThumbnail from "./VisThumbnail.svelte";

  export let disabled;
</script>

<div class:disabled class="uk-height-medium">
  <p class="uk-width-1-1">Select visualization type</p>
  <div class="container">
    <VisThumbnail {disabled} />
    <VisThumbnail {disabled} />
    <VisThumbnail {disabled} />
    <VisThumbnail {disabled} />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  p {
    margin-bottom: 7px;
  }
</style>
