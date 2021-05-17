<script>
  import { onMount } from "svelte";
  import { showWelcomeModal } from "./stores/ui";
  import UIkit from "uikit";

  let modalLoaded = false;

  onMount(() => {
    modalLoaded = true;
    UIkit.util.on("#welcome-modal", "hide", function (e) {
      showWelcomeModal.set(false);
    });
  });

  $: if (modalLoaded && $showWelcomeModal) {
    UIkit.modal("#welcome-modal").show();
  }
</script>

<div class="uk-modal-container" id="welcome-modal" uk-modal>
  <div class="uk-modal-dialog">
    <button class="uk-modal-close-default" type="button" uk-close />
    <div class="uk-modal-body">
      <img
        alt="TimeElide"
        class="logo uk-margin-bottom"
        src="images/logo-basic.png"
      />

      <div class="uk-child-width-1-2@m" uk-grid>
        <div>
          TimeElide helps you to visualize <strong
            >non-contiguous time series slices</strong
          >, namely time intervals that contain a sequence of time-value pairs
          but are not adjacent to each other. Examples of non-contiguous slices
          are sleep cycles, working shifts, public holidays, weekend evenings,
          and so on.
        </div>
        <div>
          <img
            alt="Non-contiguous time-series slices"
            class="uk-width-1-1"
            src="images/non-contiguous-time-slices.png"
          />
        </div>
      </div>

      <ul class="uk-accordion" uk-accordion>
        <li>
          <span class="uk-accordion-title">
            <span class="accordion-number">1</span> Data
          </span>
          <div class="uk-accordion-content">
            <p>
              You can explore sample datasets or upload your own CSV file. A
              dataset must include one column with timestamps and one column
              with numeric values. All time slices need to be combined into a
              single file.
            </p>
          </div>
        </li>
        <li>
          <span class="uk-accordion-title">
            <span class="accordion-number">2</span> Slicing options
          </span>
          <div class="uk-accordion-content">
            <p>
              Some datasets, such as the heart rate during workouts or
              recordings of sleep cycles, are divided into time-series slices by
              nature. TimeElide can automatically detect and visualize these
              slices.
            </p>
            <p>
              Other datasets contain continuous recordings between a start and
              end date but you might be only interested in very specific known
              time periods. TimeElide allows you to manually select these slice
              boundaries and remove extraneous data. Slices can be unevenly
              spaced (e.g., every Tuesday and Thursday) but a slice cannot be
              longer than 24 hours.
            </p>
          </div>
        </li>
        <li>
          <span class="uk-accordion-title">
            <span class="accordion-number">3</span> Visual encoding choices for multiple
            levels of detail
          </span>
          <div class="uk-accordion-content">
            <div class="uk-child-width-1-2@l" uk-grid>
              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img src="images/sparkboxes.png" alt="" uk-cover />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">Sparkboxes</h3>
                    <p>
                      High level of detail: raw data is shown in the foreground
                      and aggregated data for each slice is shown in the
                      background.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img src="images/steppedAreaChart.png" alt="" uk-cover />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">Stepped area chart</h3>
                    <p>
                      Low level of detail: The values of each slice are
                      aggregated (average, min, max, or median) and shown as a
                      stepped area curve.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img src="images/heatmap.png" alt="" uk-cover />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">2D Heatmap</h3>
                    <p>
                      Medium level of detail: each column corresponds to one
                      slice and the within-slice data is aggregated to bins and
                      shown as coloured rectangles.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img src="images/heatStripes.png" alt="" uk-cover />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">Heat stripes</h3>
                    <p>
                      Low level of detail: The values of each slice are
                      aggregated (average, min, max, or median) and shown as
                      vertical coloured stripes.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img
                      src="images/multiSeriesLineChart.png"
                      alt=""
                      uk-cover
                    />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">Multi-series line chart</h3>
                    <p>
                      High degree of detail: Slices are superimposed to allow
                      easier comparisons of within-slice patterns when the order
                      of the slices is not important.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="vis-card uk-grid-small uk-grid-match uk-child-width-1-2"
                uk-grid
              >
                <div>
                  <div class="uk-cover-container">
                    <img
                      src="images/bandedMultiSeriesLineChart.png"
                      alt=""
                      uk-cover
                    />
                  </div>
                </div>
                <div>
                  <div class="vis-card-body">
                    <h3 class="vis-card-title">
                      Banded multi-series line chart
                    </h3>
                    <p>
                      Low level of detail: All values are aggregated across
                      slices to help you recognize general within-slice trends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</div>

<style>
  .uk-modal-dialog {
    width: 1000px;
    font-size: 0.95rem;
  }
  .logo {
    width: 140px;
  }
  .uk-accordion > :nth-child(n + 2) {
    margin: 0;
  }
  .uk-accordion > li {
    border-top: 1px solid #ddd;
    padding: 10px 0;
  }
  .uk-accordion > li:last-child {
    border-bottom: 1px solid #ddd;
  }
  .uk-accordion-content {
    margin-top: 10px;
  }
  .accordion-number {
    border: 1px solid #c1c1c1;
    border-radius: 50%;
    margin-right: 10px;
    display: inline-block;
    height: 24px;
    width: 24px;
    line-height: 24px;
    text-align: center;
    font-weight: 500;
    font-size: 0.95rem;
    color: #666;
  }
  .vis-card-body {
    font-size: 0.75rem;
  }
  .vis-card-body p {
    margin: 5px 0;
  }
  h3.vis-card-title {
    font-size: 1rem;
    font-weight: 500;
    margin: 0 0 5px 0;
  }
  .uk-cover-container {
    border-radius: 6px;
    border: 1px solid #ddd;
  }
</style>
