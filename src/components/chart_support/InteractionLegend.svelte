<script>
  export let leftMargin = 0;
</script>

<div class="uk-inline interaction-legend" style="--left-margin: {leftMargin}px">
  <div class="uk-flex">
    <div>
      <img src="images/interact_icon.png" alt="Zoom, pan, hover interaction" />
    </div>
    <div>
      Hover over slices for more details.<br/>
      Scroll to zoom in and out.
    </div>
  </div>
</div>

<style>
  .interaction-legend {
    font-size: 0.7rem;
    color: #555;
    vertical-align: top;
    margin-left: var(--left-margin);
  }
</style>
