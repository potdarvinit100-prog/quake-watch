"use strict";

// Real-time global earthquakes from the USGS past-day GeoJSON feed.
// No API key. Sorted newest first, filterable by minimum magnitude.
const FEED_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

const minMagSelect = document.getElementById("minMag");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const summaryEl = document.getElementById("summary");
const listEl = document.getElementById("list");
const sourceLineEl = document.getElementById("sourceLine");

function magClass(mag) {
  if (mag >= 6) return "mag m6";
  if (mag >= 5) return "mag m5";
  if (mag >= 4) return "mag m4";
  return "mag";
}

function render(events) {
  listEl.textContent = "";
  for (const feature of events) {
    const props = feature.properties;
    const coords = feature.geometry && feature.geometry.coordinates;
    const depth = coords && typeof coords[2] === "number" ? coords[2].toFixed(1) : "unknown";

    const item = document.createElement("li");

    const badge = document.createElement("span");
    badge.className = magClass(props.mag);
    badge.textContent = "M" + props.mag.toFixed(1);
    item.appendChild(badge);

    const body = document.createElement("div");
    const place = document.createElement("p");
    place.className = "place";
    place.textContent = props.place || "Unknown location";
    body.appendChild(place);

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent =
      new Date(props.time).toLocaleString() +
      " · Depth " + depth + " km · " +
      (props.magType ? props.magType.toUpperCase() + " · " : "") +
      (props.status === "reviewed" ? "Reviewed" : "Automatic (preliminary)");
    body.appendChild(meta);

    const link = document.createElement("p");
    link.className = "meta";
    const anchor = document.createElement("a");
    anchor.href = props.url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.textContent = "USGS event page";
    link.appendChild(anchor);
    body.appendChild(link);

    item.appendChild(body);
    listEl.appendChild(item);
  }
}

async function load() {
  const minMag = parseFloat(minMagSelect.value);
  statusEl.textContent = "Loading live data…";
  errorEl.hidden = true;
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error("API returned HTTP " + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) {
      throw new Error("Unexpected API response");
    }
    const events = data.features
      .filter((f) => f.properties && f.properties.type === "earthquake")
      .filter((f) => typeof f.properties.mag === "number" && f.properties.mag >= minMag)
      .sort((a, b) => b.properties.time - a.properties.time)
      .slice(0, 100);

    render(events);
    const strongest = events.reduce(
      (max, f) => Math.max(max, f.properties.mag), 0);
    summaryEl.textContent =
      events.length + " earthquakes at magnitude " + minMag.toFixed(1) + "+ in the last 24 hours" +
      (events.length > 0 ? " · Strongest: M" + strongest.toFixed(1) : "") + ".";
    statusEl.textContent = "Live data loaded.";
    sourceLineEl.textContent =
      "Source: USGS all-day GeoJSON feed. Feed generated: " +
      new Date(data.metadata.generated).toLocaleString() +
      ". Page last updated: " + new Date().toLocaleString() + ".";
  } catch (err) {
    listEl.textContent = "";
    summaryEl.textContent = "";
    errorEl.hidden = false;
    errorEl.textContent = "Could not load live data from USGS (" + err.message +
      "). No events are shown rather than old or invented ones. Check your connection and try Refresh.";
    statusEl.textContent = "Live data unavailable.";
  }
}

minMagSelect.addEventListener("change", load);
document.getElementById("refresh").addEventListener("click", load);
load();
setInterval(load, 5 * 60 * 1000);
