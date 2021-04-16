import { writable } from "svelte/store";
import { chartSpecificSettingsObj, globalSettingsObj } from "./chartSettings";

export const dataSource = writable(undefined);
export const fullData = writable([]);
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

// const storedWelcomeModalFlag = localStorage.getItem("visited");
// export const showWelcomeModal = writable(storedWelcomeModalFlag);
// showWelcomeModal.subscribe(value => {
//     localStorage.setItem("visited", value);
// });


// Use local storage
export const showWelcomeModal = writable(localStorage.getItem('intro') === null 
  || localStorage.getItem('intro') === 'true');
// showWelcomeModal.subscribe((value) => localStorage.setItem(value));
showWelcomeModal.subscribe((value) => localStorage.setItem('intro', String(value)));