export const chartSpecificSettingsObj = {
  sparkboxes: {
    layers: layersObj,
    showTimeline: showTimelineObj,
    colourScheme: colourSchemeObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
  },
  multiSeriesLineChart: {
    showTimeline: showTimelineObj,
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
    showTimeline: showTimelineObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  colourHeatmap: {
    showTimeline: showTimelineObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  dotHeatmap: {
    showTimeline: showTimelineObj,
    aggregation: aggregationObj,
  },
};

const layersObj = {
  key: "layers",
  type: "multi-select",
  options: ["min-max", "iqr", "avg", "median"],
  default: ["min-max", "iqr", "avg"],
  selectedValue: null,
};

const showTimelineObj = {
  key: "showTimeline",
  type: "boolean",
  default: true,
  selectedValue: null,
};

const colourSchemeObj = {
  key: "colourScheme",
  type: "select",
  default: "?", // ???
  options: [],
  selectedValue: null,
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
  default: 1,
  range: [0, 1],
  selectedValue: null,
};

const xScaleModeObj = {
  key: "xScaleMode",
  type: "select",
  options: ["normalized duration", "absolute duration", "absolute time"],
  default: "normalized duration",
  selectedValue: null,
};

const binsObj = {
  key: "bins",
  type: "number",
  // default:
  // options:
  selectedValue: null,
};

const aggregationObj = {
  key: "aggregation",
  type: "select",
  default: "avg",
  options: ["avg", "median", "min", "max"], // (none) ?
  selectedValue: null,
};

export const globalSettingsObj = {
  width: {
    key: "width",
    type: "number",
    default: 1000,
    range: [500, 1200],
    selectedValue: null,
  },
  height: {
    key: "height",
    type: "number",
    default: 1000,
    range: [500, 1200],
    selectedValue: null,
  },
  showTooltip: {
    key: "showTooltip",
    type: "boolean",
    default: true,
    selectedValue: null,
  },
};
