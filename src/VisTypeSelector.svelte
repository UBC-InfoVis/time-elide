<script>
  import VisThumbnail from "./VisThumbnail.svelte";

  export let disabled;
</script>

<div class:disabled class="container">
  <p class="uk-width-1-1">Select visualization type</p>
  <VisThumbnail />
  <VisThumbnail />
  <VisThumbnail />
  <VisThumbnail />
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
  }

  p {
    margin-bottom: 7px;
  }
</style>
