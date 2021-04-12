<script>
  import { selectedVisType } from "./stores";

  export let visType;
</script>

<div>
  <button
    on:click={() => selectedVisType.set(visType)}
    uk-tooltip="title: {visType.title}; delay: 250; animation: uk-animation-fade"
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
    opacity: 0.6;
    transition: all 180ms ease-in-out;
  }
  .disabled .thumbnail img {
    opacity: 0.3;
  }
  .thumbnail:hover img, .thumbnail.active img {
    opacity: 1;
  }
</style>
