# Quake Watch

## Real-time problem it solves

When news of a big earthquake breaks, the natural question is: how big was
it, where exactly, and was it the only one? Quake Watch answers that from the
live USGS feed — every earthquake in the last 24 hours, newest first, with a
magnitude filter so small tremors do not bury the significant events.

## Data source

- USGS Earthquake Hazards Program, GeoJSON feed for the past day:
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
  No API key.
- Only entries of type `earthquake` are shown. Each card links to its USGS
  event page for full detail.

## How to run

No build step and no dependencies. Open `index.html` in a browser, or serve
the folder, for example:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000

## Honest limits

- USGS values are preliminary: magnitudes and locations can be revised after
  review, and automatic detections can be corrected. The card says whether an
  event is reviewed or still automatic.
- The list is capped at the 100 newest matching events for readability; the
  feed itself can contain more.
- If the feed request fails, the page shows an error and no events — it
  never shows stale or invented earthquakes as live.
- Auto-refresh runs every 5 minutes.
