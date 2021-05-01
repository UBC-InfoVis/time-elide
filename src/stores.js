import { writable } from "svelte/store";
import { chartSpecificSettingsObj, globalSettingsObj } from "./chartSettings";

export const loading = writable(false);

export const dataSource = writable(undefined);
export const loadedData = writable([]);
export const slicedData = writable([]);
export const tooltipData = writable(undefined);

export const selectedVisType = writable(undefined);

export const pageWidth = writable(0);
export const containerWidth = writable(1000);
export const containerHeight = writable(400);

export const dataSlicingSelection = writable("none selected");
export const validSlicingSelection = writable(false);

export const chartSpecificSettings = writable(chartSpecificSettingsObj);
export const globalSettings = writable(globalSettingsObj);


// Use local storage
export const showWelcomeModal = writable(localStorage.getItem('intro') === null 
  || localStorage.getItem('intro') === 'true');
showWelcomeModal.subscribe((value) => localStorage.setItem('intro', String(value)));