<script>
  // import "../node_modules/uikit/dist/css/uikit.min.css";
  export let disabled;
</script>

<div class:disabled>
  <p>Select slicing method</p>
  <button class="uk-button uk-button-default uk-button-large option" {disabled}
    >Option 1
    <h3>Select periods manually</h3>
  </button>
  <button class="uk-button uk-button-default uk-button-large option" {disabled}
    >Option 2
    <h3>Detect periods automatically</h3>
  </button>
</div>

<style>
  .disabled {
    opacity: 0.6;
  }

  .option {
    border-radius: 8px;
    border: 1px solid #dfe0eb;
    padding: 11px 25px;
    color: #ffffff;
    height: 134px;
    width: 80%;
    text-align: left;
  }
</style>
