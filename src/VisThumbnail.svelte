<script>
  import { selectedVisType } from "./stores";

  export let visType;
  export let disabled;
</script>

<div>
  <button
    on:click={() => selectedVisType.set(visType)}
    class="thumbnail uk-cover-container uk-button uk-button-default btn-lg {($selectedVisType && visType.key == $selectedVisType.key) ? 'active' : ''}"
    >
    <img src="images/{visType.key}.png" alt="{visType.key}" uk-cover />
  </button>
</div>

<style>
  .thumbnail {
    background: #ffffff;
    height: 5vw;
    width: 100%;
  }
  .thumbnail img {
    opacity: 0.5;
    transition: all 180ms ease-in-out;
  }
  .disabled .thumbnail img {
    opacity: 0.3;
  }
  .thumbnail:hover img, .thumbnail.active img {
    opacity: 1;
  }
</style>
