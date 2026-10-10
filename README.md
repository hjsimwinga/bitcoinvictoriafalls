# Bitcoin Victoria Falls

Community data dashboard: https://hjsimwinga.github.io/bitcoinvictoriafalls/

## Data

`data.json` contains the education, meetup, and sampled merchant records, source URLs, snapshot date, and methodology notes. Education and meetup records cover March 2024–June 2026. Online figures were checked 10 October 2026.

- 17 cohorts, 280 graduates. The community owner confirmed the sum of the rows rather than the screenshot footer (275).
- 19 meetups, 1,101 attendance visits (838 in 2025; 263 in 2026). These are not unique participants.
- BTC Map snapshot: 124 mapped locations, 17 recently verified. The six local merchant records are a latest-added sample, not a complete directory.
- Geyser snapshot: 4,244,729 sats, 44 contributors.

## Updating

Edit the records in `data.json`; education and meetup totals, tables, filters and charts recalculate automatically. Merchant/funding snapshot values and their displayed dates in `index.html` must also be updated after verifying the external sources. Do not imply missing months have zero activity.

The period selector applies to education and meetups, not external snapshots. CSV export follows the current dataset, period, area and search filters. JSON contains the full dataset and notes.

## Website

Static HTML, CSS and JavaScript; no build or installation required. GitHub Pages publishes `main` from the repository root. The community map uses BTC Map's documented iframe embed. Branding assets were supplied by the community owner. Team names and roles were supplied by the owner; Adam's surname is documented on Geyser.

## Sources

- https://btcmap.org/community/bitcoin-victoria-falls/merchants
- https://btcmap.org/community/bitcoin-victoria-falls/stats
- https://geyser.fund/project/bitcoinvictoriafalls
- https://x.com/BitcoinVicFalls
- Nostr profile: linked in `data.json` and the website.
- Education and meetup tables: community-supplied screenshots.
