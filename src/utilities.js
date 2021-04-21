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

function abbreviateNumber(value) {
  if (value < 0) {
    return roundNumber(value, 1);
  } else if (value >= 1000 && value < 1000000) {
    return roundNumber(value/1000, 0) + 'k';
  } else if (value >= 1000000) {
    return roundNumber(value/1000000, 1) + 'M';
  } else {
    return value;
  }
  return value;
}

export { secondsToHM, roundNumber, abbreviateNumber };