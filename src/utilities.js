function secondsToHM(seconds) {
  let hours   = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - (hours * 3600)) / 60);
  if (hours   < 10) { hours   = "0"+hours }
  if (minutes < 10) { minutes = "0"+minutes }
  return hours+':'+minutes;
}

function roundNumber(value, precision) {
  let multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export { secondsToHM, roundNumber };