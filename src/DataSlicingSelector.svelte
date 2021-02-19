<script>
  export let disabled;
</script>

<div class:disabled>
  <p>Select slicing method</p>
  <div class:disabled class="option">
    Option 1
    <h3>Select periods manually</h3>
  </div>
  <div class:disabled class="option">
    Option 2
    <h3>Detect periods automatically</h3>
  </div>
</div>

<style>
  .disabled {
    opacity: 0.6;
  }

  .option {
    border-radius: 8px;
    border: 1px solid #dfe0eb;
    margin: 11px 25px;
    background: #ffffff;
    height: 134px;
  }
</style>
