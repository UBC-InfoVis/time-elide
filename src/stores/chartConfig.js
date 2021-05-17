import { writable } from "svelte/store";

import {
  chartSpecificSettingsObj,
  globalSettingsObj,
} from "../constants/chartSettings";

export const chartSpecificSettings = writable(chartSpecificSettingsObj);
export const globalSettings = writable(globalSettingsObj);
