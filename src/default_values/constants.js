export const MANUAL_SELECT = "manual select";
export const DETECT_PERIODS = "detect periods";
export const NONE_SELECTED = "none selected";

export const RENDERING_ERROR =
  "Error: Visualization cannot be rendered with this slicing method.";

export const visTypes = [
  {
    key: "sparkboxes",
    component: "Sparkboxes",
    title: "Sparkboxes",
    desc: "High level of detail: raw data is shown in the foreground and aggregated data for each slice is shown in the background.",
  },
  {
    key: "steppedAreaChart",
    component: "SteppedAreaChart",
    title: "Stepped area chart",
    desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as a stepped area curve.",
  },
  {
    key: "heatmap",
    title: "2D Heatmap",
    desc: "Medium level of detail: each column corresponds to one slice and the within-slice data is aggregated to bins and shown as coloured rectangles.",
  },
  {
    key: "heatStripes",
    title: "Heat stripes",
    desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as vertical coloured stripes.",
  },
  {
    key: "multiSeriesLineChart",
    title: "Multi-series line chart",
    desc: "High degree of detail: Slices are superimposed to allow easier comparisons of within-slice patterns when the order of the slices is not important.",
  },
  {
    key: "bandedMultiSeriesLineChart",
    title: "Banded multi-series line chart",
    desc: "Low level of detail: All values are aggregated across slices to help you recognize general within-slice trends.",
  },
];

export const dataSamples = [
  {
    url: "data/ocupado_lecture_building.csv",
    title: "Occupancy (Building 1, all)",
    variable: "Occupancy",
    datasetType: "manual",
  },
  {
    url: "data/ocupado_community_building.csv",
    title: "Occupancy (Building 2, all)",
    variable: "Occupancy",
    datasetType: "manual",
  },
  {
    url: "data/ocupado_community_building_fri_18_24.csv",
    title: "Occupancy (Building 2, sliced)",
    variable: "Occupancy",
    datasetType: "automatic",
  },
  {
    url: "data/bakery_15min.csv",
    title: "Sales at a bakery",
    variable: "# Transactions",
    datasetType: "manual",
  },
  {
    url: "data/soccer_player.csv",
    title: "Soccer player",
    variable: "# Actions",
    datasetType: "automatic",
  },
  {
    url: "data/bike_rides.csv",
    title: "Bike rides",
    variable: "Speed (km/hour)",
    datasetType: "automatic",
  },
];
