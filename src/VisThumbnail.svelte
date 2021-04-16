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
    <span
      class="vis-type-info" 
      uk-icon="icon: question; ratio: 0.8"
      uk-tooltip="title: {visType.desc}; pos: right; offset: 10"
    ></span>
  </button>
</div>

<style>
  .thumbnail {
    background: #ffffff;
    height: 5vw;
    width: 100%;
    position: relative;
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
  .thumbnail:hover .vis-type-info {
    display: block;
  }
  .vis-type-info {
    transition: all 180ms ease-in-out;
    display: none;
    position: absolute;
    top: 3px;
    right: 3px;
    padding: 2px;
    background: #fff;
    border-radius: 50%;
  }
</style>
