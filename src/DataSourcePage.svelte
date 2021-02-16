<script>
 //import 'uikit/dist/js/uikit.min.js';

  let dataSamples = [
    { id: 1, url: 'data/us_gdp_sliced_data.csv' },
    { id: 2, url: 'data/us_gdp_sliced_data.csv' },
  ];

  /*
  UIkit.upload('.js-upload', {
      
      url: '',
      multiple: false,

      beforeSend: function (environment) {
          console.log('beforeSend', arguments);

          // The environment object can still be modified here. 
          // var {data, method, headers, xhr, responseType} = environment;

      },
      beforeAll: function () {
          console.log('beforeAll', arguments);
      },
      load: function () {
          console.log('load', arguments);
      },
      error: function () {
          console.log('error', arguments);
      },
      complete: function () {
          console.log('complete', arguments);
      },

      loadStart: function (e) {
          console.log('loadStart', arguments);

          bar.removeAttribute('hidden');
          bar.max = e.total;
          bar.value = e.loaded;
      },

      progress: function (e) {
          console.log('progress', arguments);

          bar.max = e.total;
          bar.value = e.loaded;
      },

      loadEnd: function (e) {
          console.log('loadEnd', arguments);

          bar.max = e.total;
          bar.value = e.loaded;
      },

      completeAll: function () {
          console.log('completeAll', arguments);

          setTimeout(function () {
              bar.setAttribute('hidden', 'hidden');
          }, 1000);

          alert('Upload Completed');
      }
  });*/

  export let dataSourceUrl;

</script>

<style>
  
</style>


<div class="uk-padding-small uk-width-expand">
  <div>
  
    <h2>Load data</h2>

    <div class="js-upload uk-placeholder uk-text-center">
      <span uk-icon="icon: cloud-upload"></span>
      <span class="uk-text-middle">Drag CSV file here or</span>
      <div uk-form-custom>
        <input type="file">
        <span class="uk-link">select one</span>
      </div>
    </div>

    <button on:click={() => (dataSourceUrl = 'data/us_gdp_sliced_data.csv')}>
      US GDP
    </button>
    <button on:click={() => (dataSourceUrl = 'data/test.csv')}>
      test
    </button>

  </div>
</div>
