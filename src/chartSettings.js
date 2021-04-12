const layersObj = {
  key: "layers",
  type: "multi-select",
  options: ["min-max", "percentiles", "average", "median"],
  default: ["min-max", "percentiles", "average"],
  selectedValue: ["min-max", "percentiles", "average"],
};

const colourSchemeObj = {
  key: "colourScheme",
  type: "select",
  default: "lines",
  options: ["lines", "boxes"],
  selectedValue: "lines",
};

const normalizeSliceWidthsObj = {
  key: "normalizeSliceWidths",
  type: "boolean",
  default: false,
  selectedValue: null,
};

const lineOpacityObj = {
  key: "lineOpacity",
  type: "number",
  default: 0.3,
  range: [0.1, 1.0],
  selectedValue: 0.3,
};

const xScaleModeObj = {
  key: "xScaleMode",
  type: "select",
  options: ["normalized duration", "absolute duration", "absolute time"],
  default: "normalized duration",
  selectedValue: "normalized duration",
};

const binsObj = {
  key: "bins",
  type: "number",
  default: 10,
  range: [1, 100],
  selectedValue: 10,
};

const aggregationObj = {
  key: "aggregation",
  type: "select",
  default: "average",
  options: ["average", "median", "min", "max"], // (none) ?
  selectedValue: "average",
};

export const chartSpecificSettingsObj = {
  sparkboxes: {
    layers: layersObj,
    colourScheme: colourSchemeObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
  },
  multiSeriesLineChart: {
    lineOpacity: lineOpacityObj,
    xScaleMode: xScaleModeObj,
  },
  confidenceBandLineChart: {
    layers: layersObj,
    colourScheme: colourSchemeObj,
    xScaleMode: xScaleModeObj,
    bins: binsObj,
  },
  steppedAreaChart: {
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  colourHeatmap: {
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  dotHeatmap: {
    aggregation: aggregationObj,
    bins: binsObj,
    xScaleMode: xScaleModeObj,
  },
};

export const globalSettingsObj = {
  width: {
    key: "width",
    type: "number",
    default: 0, // set in App.svelte based on window size
    range: [400, 1200],
    selectedValue: 0, // set in App.svelte based on window size
  },
  height: {
    key: "height",
    type: "number",
    default: 400,
    range: [300, 1200],
    selectedValue: 400,
  },
  showTooltip: {
    key: "showTooltip",
    type: "boolean",
    default: true,
    selectedValue: true,
  },
  showTimeline: {
    key: "showTimeline",
    type: "boolean",
    default: true,
    selectedValue: true,
  }
};
