import { writable } from "svelte/store";
import { NONE_SELECTED } from "../default_values/constants";
export const loading = writable(false);

export const dataSource = writable(undefined);
export const loadedData = writable([]);
export const slicedData = writable([]);
export const tooltipData = writable(undefined);

export const selectedVisType = writable(undefined);

export const pageWidth = writable(0);

export const dataSlicingSelection = writable(NONE_SELECTED);
export const validSlicingSelection = writable(false);

export const slicerErrorMessage = writable(undefined);

// Use local storage
export const showWelcomeModal = writable(
  localStorage.getItem("intro") === null ||
    localStorage.getItem("intro") === "true"
);
showWelcomeModal.subscribe((value) =>
  localStorage.setItem("intro", String(value))
);
