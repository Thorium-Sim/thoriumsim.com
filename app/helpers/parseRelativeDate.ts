export function parseDate(timestamp: number) {
  if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
    // Longer than a month
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  // Longer than a day
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return `${Math.round(
      (Date.now() - timestamp) / (24 * 60 * 60 * 1000)
    )} days ago`;
  }
  if (Date.now() - timestamp > 60 * 60 * 1000) {
    // Longer than an hour
    return `${Math.round(
      (Date.now() - timestamp) / (60 * 60 * 1000)
    )} hours ago`;
  }
  if (Date.now() - timestamp > 60 * 1000) {
    // Longer than a minute
    return `${Math.round((Date.now() - timestamp) / (60 * 1000))} minutes ago`;
  }
  if (Date.now() - timestamp > 1000) {
    // Longer than a second
    return `${Math.round((Date.now() - timestamp) / 1000)} seconds ago`;
  }
  return "less than 1 second ago";
}
