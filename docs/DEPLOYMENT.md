# FilthyFilter production deployment

## Target

- Public URL: `https://filthyfilter.sk/`
- Server: `93.184.77.193`
- SSH user: `jg046600`
- Remote document root: `/home/jg046600/www_root_filthyfilter_sk`
- SSH identity: `%USERPROFILE%\.ssh\id_ed25519_whispair`
- SSH port: `22261`, supplied by the user on 2026-09-08. The window is temporary and the
  port rotates on every activation; rebind with `whispair-api/scripts/update-webhouse-ssh-port.ps1`,
  which verifies the new port presents the already-trusted key instead of bypassing the check.
  Earlier ports used for releases: 22597 (2026-09-07), 22418, 22690.

- Deploy changes to dev first; production is a separate release.

## Produkčná brána Google Ads

Plánované ostré nasadenie marketingového funnelu, produkčný Google Ads worker
a spustenie platenej kampane sú pozastavené do vzniku vlastnej s. r. o. Nestačí
mať nasadený kód: musí existovať správny firemný Ads a platobný profil, Ads
prístup servisného účtu, operating/login account ID, päť conversion action ID,
úspešný `validateOnly` beh na DEV aj PROD a denný produkčný Webcron.

Autoritatívny checklist je v `GOOGLE_ADS_PRODUCTION_GATE.md`. Každá release
poznámka marketingového funnelu musí uviesť, či je táto brána **SPLNENÁ** alebo
**NESPLNENÁ**. Pri nesplnenej bráne sa nesmie aktivovať produkčný Google Ads
worker, prepnúť `GOOGLE_DM_VALIDATE_ONLY=0`, spustiť Google Ads kampaň ani release
označiť ako kompletne produkčný. Urgentné bezpečnostné opravy a opravy chýb webu
môžu ísť von, ak nemenia Google Ads konfiguráciu, Webcron ani kampaň.

`filthyfilter.sk` was registered on 5 September 2026 and is parked on the same
WebHouse account as the whispAir projects. Its own document root
`www_root_filthyfilter_sk` was created by WebHouse and initially contained only
the `webhouse.html` placeholder. The site is served from the root of that
domain, so no path prefix applies and every asset reference stays relative.

The older location `https://whispair.sk/filthyfilter/` was removed on
5 September 2026 on the user's instruction, once the site was live on its own
domain. `/home/jg046600/www_root_whispair_sk/filthyfilter` no longer exists and
that path now answers `404`. The final state of that directory is archived at
`/home/jg046600/tmp/whispair-filthyfilter-subpath-final-backup.tar.gz`,
21,425,166 bytes. Nothing redirects from the old path, so any inbound link to
it is now dead. The user plans to link the two brands later, for example under
`cistenie.whispair.sk`.

The `_sub_whispair_sk` and `_sub_filthyfilter_sk` directories are only for
subdomains and are not deployment targets for this site.

## Two builds, not one build with a flag

`tmp/build_staging.py` writes the staging package: `noindex` injected into every
page, `robots.txt` replaced with a blanket disallow, `sitemap.xml` omitted.
`tmp/build_production.py` writes the production package and contains none of
that, plus the real `robots.txt`, `sitemap.xml` and `.htaccess`. It raises
before writing the tar if `noindex` appears anywhere in the package.

They are separate files on purpose. On 8 September 2026 the staging tar was
extracted into the production root, which put `noindex` on all five live pages
and `Disallow: /` in the live `robots.txt`. A single build with a flag is one
forgotten argument away from repeating that; two files are not.

### Last production deploy

- Date: 2026-09-08, WhatsApp in the mobile bar, the stray `data-inquiry` fix and
  the brand line in every WhatsApp message. Commit `683bb20`. SSH port 22530.
- Package `ff-prod-whatsapp-20260908.tar.gz`, 25 493 825 bytes, five pages, zero
  `noindex`, SHA-256 `4306e433…d7a0` identical local and remote.
- Backup: `/home/jg046600/tmp/ff-prod-before-whatsapp-20260908.tar.gz`.
- The root was inspected before the release and held exactly the expected
  twenty entries: no `webhouse.html`, no `system-review`, no `noindex`, nothing
  left over from the incident earlier that day.
- Verified live: five pages plus `robots.txt` and `sitemap.xml` answer 200,
  `noindex` appears zero times on all five served pages, `robots.txt` reads
  `Allow: /` with the sitemap line, and `www.filthyfilter.sk` answers 301 to the
  bare host, so the `.htaccess` rule is in effect.
- Six files match the repository byte for byte: all three pages, `js/main.js`,
  `css/styles.css` and `sitemap.xml`.
- The bar shows three buttons in one row at 360px on all three pages, its
  WhatsApp link opens with "Dopyt z filthyfilter.sk", and a service card opens
  with the same first line. No link without `data-contact` was rewritten.
- Built with `tmp/build_production_20260908c.py`, which replaces the old
  `build_production.py` for the same reason the staging one was replaced: the
  old file list named `android-chrome-*` icons this repo has never had, so the
  four icons `site.webmanifest` references were skipped. The replacement takes
  its paths as arguments and refuses to write the tar unless the package has
  exactly five pages, zero `noindex`, a permissive `robots.txt` that names the
  sitemap, both `sitemap.xml` and `.htaccess`, and none of `tests`, `docs`,
  `interne`, `node_modules` or the repository's own Markdown. The same checks
  run again on the server before extraction, in
  `tmp/prod-deploy-20260908.sh`.

### Previous production deploy

- Date: 2026-09-08, viewport-dependent display face and the FAQ markup fix,
  commit `29c71c3`. SSH port 22790.
- Package `ff-prod-fonts-20260908.tar.gz`, 25 102 478 bytes, five pages, zero
  `noindex`. Backup: `/home/jg046600/tmp/ff-prod-before-fonts-20260908.tar.gz`.
- Verified live: five pages plus `robots.txt` and `sitemap.xml` answer 200,
  `noindex` absent from the served homepage, `robots.txt` reads `Allow: /`
  with the sitemap line, and `css/styles.css` matches the repository byte for
  byte (SHA-256 `ac94c40f…e7cb`).
- Earlier the same day this root briefly held the staging package; see the
  incident note in `STATUS.md`.
- CSS is served with `ETag` and `Last-Modified` but no `Cache-Control`, so a
  returning browser revalidates rather than serving the old stylesheet. The
  `?v=` query string on the stylesheet link was therefore left alone.

## Staging — dev.filthyfilter.sk

- Public URL: `https://dev.filthyfilter.sk/`
- Remote document root: `/home/jg046600/_sub_filthyfilter_sk/dev`

Subdomains on this account live at `_sub_<domain>/<name>`, the same convention
as `dev.whispair.sk`. DNS already resolves every subdomain to the server and
Apache picks the directory up as soon as it exists, so no control-panel step
was needed. Before the directory existed, `dev.filthyfilter.sk` simply served
the main document root.

The staging copy is the production release with three differences, and they
have to be reapplied on every staging deploy:

1. `robots.txt` is replaced with a blanket `Disallow: /`.
2. Every HTML document gets `<meta name="robots" content="noindex, nofollow">`
   after the viewport meta. There are five of them as of 7 September 2026:
   the homepage, both landing pages, the case file and the privacy notice. Apply it by globbing the
   package for `*.html` rather than by listing paths, or the next page added will
   quietly go out indexable.
3. `sitemap.xml` is left out of the package.

The canonical links keep pointing at `https://filthyfilter.sk/`, so a crawler
that reaches staging anyway is told where the real page is.

`scripts` for this are not committed; the staging package is built by copying
`index.html`, `robots.txt`, the root icon files, `site.webmanifest`, `assets/`,
`css/`, `js/`, `hall/`, `cistenie-klimatizacie/`, `servis-klimatizacie/`
and `ochrana-osobnych-udajov/`,
applying the three changes above, then following the same upload, extract and
chmod steps as production but against the staging root.

`.htaccess` is deliberately left out of the staging package. Its only rule
redirects the production `www` host, which never reaches this document root, so
shipping it here would add a file that can only ever do nothing or go wrong.

### Last staging deploy

- Date: 2026-09-08, WhatsApp in the mobile bar, the stray `data-inquiry` fix and
  the brand line in every WhatsApp message. Commit `2f72f69`.
- SSH port: 22530, supplied by the user. The pin sat on 22261, which was closed;
  22790 accepted TCP but refused the SSH banner, so port reachability is not a
  usable signal on this host. Rebound with the documented script, which verified
  22530 presents the already-trusted key. The panel offers
  `StrictHostKeyChecking=no`; it was not used.
- Web only, no API release. Package `ff-dev-whatsapp-20260908.tar.gz`,
  25 493 483 bytes, five pages, all five noindex, SHA-256 `c927ec30…6441`
  identical local and remote.
- Backup: `/home/jg046600/tmp/ff-dev-before-whatsapp-20260908.tar.gz`.
- Verified live: five pages and `robots.txt` answer 200, `sitemap.xml` 404,
  staging robots reads `Disallow: /`, and `js/main.js` and `css/styles.css`
  match the repository byte for byte. The bar shows three buttons at 360px in
  one row on all three pages, and its WhatsApp link opens with
  "Dopyt z filthyfilter.sk".
- Production untouched: homepage SHA-256
  `00a0c877…3a68` before and after, `robots.txt` still `Allow: /`, no `noindex`
  on the live homepage.
- **The old `tmp/build_staging.py` shipped no icons.** Its file list named
  `android-chrome-192x192.png` and friends, which this repo has never had, so
  the four icons `site.webmanifest` actually references were silently skipped
  and only survived on the server from an earlier upload. Replaced by
  `tmp/build_staging_20260908c.py`, which takes the root, output and archive as
  arguments, names the real icons, and refuses to write the tar unless every
  page carries exactly one robots meta and `.htaccess`, `sitemap.xml`, `tests`,
  `docs`, `interne` and `node_modules` are all absent.
- Note for the next deploy: a remote command sent inline through Windows
  PowerShell loses its quoting, and a bracket in an `echo` is enough to break
  the remote shell. Send a script file and run it, as
  `tmp/remote-deploy-dev-20260908.sh` does.

### Previous staging deploy

- Date: 2026-09-08, second half of phase 1: click-to-WhatsApp attribution.
- SSH port: 22261, host key as pinned.
- API only (`api-dev`, branch `feature/service-package-vat`, commits `06ed3ff`
  and `0df23e2`): migration `20260908120000` (meta_ad_id), the WhatsApp helpers
  and `tools/backfill_whatsapp_referrals.php`. The website was not redeployed;
  nothing on it changed.
- Note for the next deploy: `scripts/` is not on the server. Server-run PHP
  one-offs belong in `tools/`, which is.
- Verified on dev by pushing one synthetic click-to-WhatsApp message through the
  real inbound path: the captured row got `business_brand=filthyfilter` and the
  attribution row got `platform=meta`, the click id, the ad id and `wa-ctwa`.
  The probe deleted exactly what it created and left nothing behind.
- Backfill dry run reports no messages with a referral, which is expected: no
  Meta campaign has run yet.
- Production untouched.

### Previous staging deploy

- Date: 2026-09-08, phase 1 of the lifecycle plan: the enquiry travels as
  fields, and the Meta click identifier is captured.
- SSH port: 22261. Host key as pinned; rebound with the documented script,
  which verified the port presents the already-trusted key.
- API (`api-dev`, branch `feature/service-package-vat`, commit `7ec8daf`):
  two migrations applied (`20260908100000` structured lead details,
  `20260908110000` attribution platform identifiers) plus four changed files.
  Neither migration is flagged destructive; both are additive and nullable.
- Web: full staging package, five pages, noindex and robots unchanged.
  `js/main.js` and `js/attribution.js` match the repository byte for byte.
- End-to-end verified with one deliberate test enquiry through
  `dev.filthyfilter.sk`: the stored row carries `business_brand=filthyfilter`,
  `lead_details` with the service code, unit count, town and preferred timing,
  and the attribution row carries `fbclid` with a derived `platform=meta`.
  A lead from before the change still reads back with nulls, so the change is
  backward compatible. Accepting consent in that test loaded the real GTM
  container once.
- Backup: `/home/jg046600/tmp/ff-dev-before-structured-lead-20260908.tar.gz`.
- Uploaded package: `/home/jg046600/tmp/ff-dev-20260908-structured-lead.tar.gz`.
- Production untouched; homepage SHA-256 unchanged before and after.

### Previous staging deploy

- Date: 2026-09-07, internal system review page, commit `d99fc05`.
- SSH port: 22597, confirmed by the user after the deploy. Host key as pinned
  in the previous record.
- Deployed on its own, not as a staging package: `interne/system-review/index.html`
  extracted into the staging root as `system-review/`, a new directory, so no
  backup was taken and nothing existing was overwritten. It stays on staging
  across future package deploys because the package extracts over the root
  without wiping it; nothing in `build_dev.py` or the release tar lists it, so
  it can never reach production by accident.
- The page is rendered from `docs/SYSTEM_REVIEW.md` by `tmp/build_system_review.py`
  (uncommitted, like the other tmp deploy scripts). It carries its own
  `noindex, nofollow, noarchive` meta; the staging `robots.txt` disallows
  everything anyway. Unlisted, not password protected.
- Verified: `https://dev.filthyfilter.sk/system-review/` answers 200, 76 154 bytes,
  SHA-256 `213e4cab…1440` identical to the repository file.
- Uploaded package: `/home/jg046600/tmp/ff-dev-system-review-20260907.tar.gz`.
- Production untouched; its homepage SHA-256 checked before and after
  (`/home/jg046600/tmp/ff-prod-before-system-review-20260907.sha256`, OK).

### Previous staging deploy

- Date: 2026-09-07, placeholder catalog images, the attribution fix on the privacy
  notice and the five published service packages behind the price feed.
- SSH port: 22597. **The host ed25519 key changed.** The pinned
  `known_hosts_whispair` still carried
  `SHA256:GyPVnlNfjn4iBEzYWl4IENKZ5FHdUhtxP5rbnerBHXo`, seen on eleven earlier
  ports, while 22597 presents `SHA256:rcRNahF2vL6Xtrn6QGzmuKanYspAeg8cQXQKFHdYf80`,
  already recorded in the ordinary `known_hosts` for ports 22480, 22854, 22211 and
  22892. The user was shown both fingerprints and instructed the new one to be
  accepted; the pin was rebound and `webhouse-ssh-status.json` updated. The claim in
  `whispair-api/README.md` that the host key never changes is therefore stale.
- All five public pages answer 200 with noindex/nofollow, robots disallows
  everything and sitemap.xml answers 404. Five catalog images answer 200.
- Deployed bytes match the repository for the three JS files, both CSS files and a
  sample image (SHA-256).
- Backup: `/home/jg046600/tmp/ff-dev-before-packages-20260907.tar.gz`.
- Uploaded package: `/home/jg046600/tmp/ff-dev-20260907-packages.tar.gz`.
- Production untouched. Its homepage SHA-256 before this work:
  `7709c29105cd2e40481a240462ec4627dc658113914fea5cade1a1e7f8f5c979`.

### Previous staging deploy

- Date: 2026-09-07, privacy notice, consent/attribution, portal prices and responsive poster.
- SSH port: 22597. Host ed25519 key matches previously trusted ports of this host,
  including 22690; pinned locally for this deployment.
- All five public pages include noindex/nofollow, robots disallows all and sitemap
  remains absent. New privacy directory, local WOFF2 fonts and licences included.
- Deployed shared in-progress express enquiry option from the working tree alongside
  this work; verified the preview updates with the feed without clearing form input.
- Seven browser tests passed; after the final privacy layout adjustment, the two
  affected price/visual tests passed again. No real lead or tracking event was sent.
- HTTPS 200 + exact local SHA-256 verified for 19 files: five pages, three JS, two CSS,
  three WebP posters, five fonts and robots. Public dev price feed: 200, empty list,
  CORS `*`. Production price route: 405; no API release or package publication here.
- Backup: `/home/jg046600/tmp/ff-dev-before-privacy-20260907-22597.tar.gz`.
- Uploaded package: `/home/jg046600/tmp/ff-dev-privacy-20260907.tar.gz`.
- Production homepage SHA-256 unchanged before/after deployment. Production release
  remains separate. Offline consent audit/export tasks: `PRIVACY_IMPLEMENTATION.md`.

### Previous staging deploy

- Date: 2026-09-07, poster adjusted to 50% transparency (opacity .5).
- Case HTML cache version case-poster-5 and CSS only; zoom remains removed.
- HTTPS verified: current CSS bytes, noindex and no zoom link.
- Rollback: `/home/jg046600/tmp/ff-dev-before-poster-50.tar.gz`.
- Production unchanged.

### Previous staging deploy

- Date: 2026-09-07, poster adjusted to 70% transparency (opacity .3).
- Case HTML cache version case-poster-4 and CSS only; zoom remains removed.
- HTTPS verified: current CSS bytes, noindex and no zoom link.
- Rollback: `/home/jg046600/tmp/ff-dev-before-poster-70.tar.gz`.
- Production unchanged.

### Previous staging deploy

- Date: 2026-09-07, poster adjusted to 25% transparency (opacity .75).
- Case HTML cache version case-poster-3 and CSS only; zoom remains removed.
- HTTPS verified: current CSS bytes, noindex and no zoom link.
- Rollback: `/home/jg046600/tmp/ff-dev-before-poster-25.tar.gz`.
- Production unchanged.

### Previous staging deploy

- Date: 2026-09-07, poster transparency follow-up.
- Case HTML and CSS only: opacity .6 (40% transparent), no zoom link or icon,
  caption shortened in SK/EN, CSS version case-poster-2.
- HTTPS verified: updated markup, exact CSS bytes and staging noindex.
- Rollback: `/home/jg046600/tmp/ff-dev-before-poster-opacity.tar.gz`.
- Production unchanged.

### Previous staging deploy

- Date: 2026-09-07, poster pilot, commit `ee3433d`, SSH port 22418.
- Updated homepage, case HTML, shared CSS and new case-poster.png only.
- Staging noindex metadata applied to both uploaded HTML files.
- Verified HTTPS 200 on all four pages, CSS, image and robots.txt; all four pages
  retain noindex, nofollow; CSS and image match local bytes.
- Rollback: `/home/jg046600/tmp/ff-dev-before-poster-ee3433d.tar.gz` contains
  the previous three text files. The newly added image is unused after rollback.
- Production untouched; production homepage SHA-256 identical before and after.
- Browser visual QA remains open; staging preview opened for user review.

### Previous staging deploy

- Date: 2026-09-07 (scrollbar cosmetic update).
- Changed only `css/styles.css` and its cache version in the four existing
  public HTML pages (`?v=scrollbar-1`). Existing staging metadata is preserved.
- Native page scrollbar: dark track, copper thumb, gold hover and light-gold
  active state; standard Firefox colours and forced-colours fallback.
- Browser verification: visible copper scrollbar, computed width `12px`,
  thumb `rgb(200, 132, 47)`, track `rgb(15, 11, 8)`.
- Rollback: `/home/jg046600/tmp/ff-dev-before-scrollbar-20260907.tar.gz`.
- Production unchanged.

### Previous staging deploy

- Date: 2026-09-07
- Commit: `778c535`
- Change: both advertising landing pages, `/cistenie-klimatizacie/` and
  `/servis-klimatizacie/`, the running service-area ticker on the homepage and on
  the cleaning page, the corrected service area (Bratislava, Trnava, Nitra plus
  20 km, replacing a 100 km radius from Senec) and the published prices.
- Verification over HTTPS: all four documents answer `200` and carry
  `noindex, nofollow`; `robots.txt` disallows everything and `sitemap.xml` is
  absent. The stylesheet is served as `?v=sectors-1` and contains the ticker
  rules, and the ticker markup is in the delivered HTML. In the browser on
  staging the service page reports its own `ff-servis` token, the ticker is
  clipped and animating, the container loads and the consent banner appears.
- Rollback archive:
  `/home/jg046600/tmp/ff-dev-before-778c535.tar.gz`
- SSH port used: 22690.

### Previous staging deploy

- Date: 2026-09-06
- Commit: `12f9d36`, patched to `c2528d0` the same day
- Change: the first release that measures anything. The enquiry posts to
  `api-dev.whispair.sk`, attribution is captured, the consent layer carries the
  `GTM-57M8XLQJ` container, prices are on the service cards and the magnifier
  icons are in.
- Verification over HTTPS: both pages answer `200` and carry
  `noindex, nofollow`; `robots.txt` disallows everything; `sitemap.xml` answers
  `404`. `js/consent.js` and `js/attribution.js` are served, the container id in
  the deployed file is `GTM-57M8XLQJ` and the API target is `api-dev`. In the
  browser the container loads, the consent banner appears, and a `gclid` plus the
  UTM set on the landing URL survive into the enquiry payload.
- Two stale files were deleted by hand: `sitemap.xml`, which does not belong on
  staging at all, and `assets/mark-bacteria.png`, replaced by `brand-mark.png` in
  `18ba44c`. Nothing referenced either. `tar -x` only adds and overwrites, so a
  file dropped from the repository has to be removed on the server each time.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-dev-before-12f9d36.tar.gz`
- First real lead through the whole chain arrived and appeared in the portal
  inbox, ready to become a job. It also exposed a defect fixed in `c2528d0`:
  the contact printed twice, once from our composed message and once from the
  columns the API appends itself. `index.html` and `js/main.js` were redeployed
  and a second lead confirmed the message is clean and that `gclid`, `utm_source`
  and the campaign are stored.
- SSH port used: 22373.

### Previous staging deploy

- Date: 2026-09-05
- Commit: `e174b09`
- Change: the PPPP Rating, the Slovak reading of FFFF, and the fix for the
  hero headline that rendered as a dark ghost on the user's phone.
- Verification over HTTPS: the page serves `styles.css?v=whispair-sales-5`, the
  headline rule carries no filter, `color-scheme: dark` is set, the @supports
  guard and the 721px branch are both present, and the old `#8a5a26` stop is
  gone from the gradient. Locally at 375px the headline computes to solid
  `#f6da9a` with no gradient, no clip and no filter; at 1360px the gradient is
  clipped to the text as before.
- Still to confirm on the reporting device: whether the headline is now legible
  on that phone. That failure mode cannot be reproduced from here.

## Internal guide — interne.filthyfilter.sk

- Public URL: `https://interne.filthyfilter.sk/`
- Remote document root: `/home/jg046600/_sub_filthyfilter_sk/interne`
- Source in this repository: `interne/`

A single self-contained page for the field team covering the Google review
funnel: what to say on site, the message templates, what is forbidden, reply
templates and where to get a printable QR code. No shared stylesheet, no
scripts beyond its own, so it loads on a phone in a van.

It is kept out of search by three separate means: a `noindex, nofollow,
noarchive` meta tag, its own `robots.txt` disallowing everything, and the fact
that nothing on the public site or in the sitemap links to it. It is not
password protected, so treat the URL as unlisted rather than secret and keep
anything confidential off it.

It is deployed on its own and is **not** part of the production or staging
package. Both the release tar and `build_dev.py` list their paths explicitly,
so `interne/` can never leak onto the public site by accident.

To update it, package and extract just that directory:

```bash
tar -czf ff-interne.tar.gz -C interne index.html robots.txt
```

The review link itself lives in the `REVIEW_LINK` constant at the bottom of the
page. While it is empty the page shows a notice instead of the link and the
templates leave it out.

## Authentication note

The FTP credentials in `D:\whispAir-IT\whispair-api\.env` can access application
subdomain roots, but do not have access to `www_root_whispair_sk`. Production
FilthyFilter deployment therefore uses the dedicated SSH key above. Do not copy
credentials or private keys into this repository.

## API dependency (from 6 September 2026)

The site is still static, but the enquiry form no longer ends in the visitor's
own WhatsApp. It posts to `whispair-api`, which stores the lead together with
its Google Ads attribution:

| Host | API it talks to |
| --- | --- |
| `filthyfilter.sk` | `https://api.whispair.sk/api/v1/leads` |
| `dev.filthyfilter.sk` | `https://api-dev.whispair.sk/api/v1/leads` |
| local preview (`127.0.0.1`, `localhost`) | `https://api-dev.whispair.sk/api/v1/leads` |

Staging and the local preview deliberately talk to the staging API, so a test
enquiry never reaches the real field inbox. The authoritative public mapping is
`config/environments.json`; `npm run build:config` generates
`js/runtime-config.js`, which every public page loads before the application
scripts. `js/main.js` also fails closed for unknown hosts instead of silently
sending their enquiries to production.

Two things must be true on the API side before a deployment can take leads:
the route `POST /api/v1/leads` exists, and `CORS_ALLOWED_ORIGINS` in that
deployment's `.env` lists the FilthyFilter origin. A missing origin fails
silently in the browser as a blocked cross-origin request; the visitor sees the
send fail and is pushed to WhatsApp, so leads are not lost, but none are stored.

Both were checked on 6 September 2026 and both are now satisfied:

| Environment | Route | CORS allowlist |
| --- | --- | --- |
| `api.whispair.sk` | `POST /api/v1/leads` answers `422` on an empty body, so it is deployed | `https://portal.whispair.sk,https://filthyfilter.sk` |
| `api-dev.whispair.sk` | same | `*` |

The production value was `https://portal.whispair.sk` alone until that date, so
a live enquiry would have been blocked. The origin was appended in
`/home/jg046600/_sub_whispair_sk/api/.env`; the previous file is kept beside it
as `.env.bak-cors-20260906`. Verified afterwards that the FilthyFilter origin is
reflected, the portal origin still is, and an unlisted origin still receives no
`Access-Control-Allow-Origin` header at all.

Note that a preflight answering `204` proves nothing about the route: the CORS
middleware answers `OPTIONS` and exits before routing happens. Test the route
with a real `POST` of `{}` and expect `422`, which reaches validation and writes
nothing.

## Canonical host

`www.filthyfilter.sk` and `filthyfilter.sk` resolve to the same document root.
Until 6 September 2026 both answered `200`, which gave search engines two copies
of every page and gave the browser two separate origins, only one of which the
API allows. `.htaccess` in the repository root now redirects `www` to the bare
domain with a `301` that keeps the path, wrapped in `IfModule` so a server
without `mod_rewrite` serves the site unchanged instead of answering `500`.

It is deployed at `/home/jg046600/www_root_filthyfilter_sk/.htaccess` and is
part of the release package below, so a redeploy cannot silently drop it.

A caution learned while installing it: the server cannot `curl` its own public
hostname, so a self-check from inside the SSH session returns `000` and looks
exactly like an outage. Verify redirects from outside the server.

The Google Tag Manager container is selected through the same generated public
runtime configuration. It is a public identifier, not a credential. If it is
empty, the page loads no Google script, sets no analytics cookie and shows no
consent banner.

## Release contents

This is a static site. Package only these public paths from the repository root:

```text
.htaccess
index.html
robots.txt
sitemap.xml
cistenie-klimatizacie/
servis-klimatizacie/
favicon.ico
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png
icon-192.png
icon-512.png
icon-192-maskable.png
icon-512-maskable.png
site.webmanifest
assets/
css/
js/
hall/
```

The icon files and `site.webmanifest` sit at the repository root on purpose.
Browsers and crawlers still ask for `/favicon.ico` and `/site.webmanifest` by
their conventional names when nothing points them elsewhere, and the pages
reference them relatively so the same files work under the local preview path.

Do not publish `.git`, `docs`, `tmp`, `README.md`, `CONTEXT.md`, `CLAUDE.md`, or local tooling.

`tmp/` is in `.gitignore` as of 6 September 2026. Two release archives had been
committed by an unqualified `git add -A` during packaging, about 21 MB each.
They were stripped from history with `git filter-branch --index-filter` and both
branches were force-pushed; a fresh bare clone is 22 MB. Build the archive
inside `tmp/`, never elsewhere, and stage explicit paths rather than `-A` when
an archive may be sitting in the tree.

## Deployment procedure

Replace `<PORT>` with the active WebHouse SSH port and `<COMMIT>` with the
deployed Git commit.

1. Generate and verify the public runtime configuration, then run the tests:

   ```powershell
   npm run build:config
   npm test
   ```

   `npm test` fails when `js/runtime-config.js` no longer matches
   `config/environments.json`, which prevents an environment mapping from being
   forgotten in the release archive.

2. Confirm the working tree, tests and pushed commit. Ak release obsahuje alebo
   aktivuje Google Ads časť funnelu, najprv potvrdiť splnenie všetkých bodov v
   `GOOGLE_ADS_PRODUCTION_GATE.md`; bez toho release zastaviť.
3. Create a clean local archive:

   ```powershell
   tar.exe -czf "tmp\filthyfilter-release-<COMMIT>.tar.gz" .htaccess index.html robots.txt sitemap.xml favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png icon-192.png icon-512.png icon-192-maskable.png icon-512-maskable.png site.webmanifest assets css js hall
   ```

4. Upload the archive to the server staging directory:

   ```powershell
   scp -i "$env:USERPROFILE\.ssh\id_ed25519_whispair" -P <PORT> -o BatchMode=yes `
     "tmp\filthyfilter-release-<COMMIT>.tar.gz" `
     "jg046600@93.184.77.193:/home/jg046600/tmp/filthyfilter-release-<COMMIT>.tar.gz"
   ```

5. Before extraction, create a rollback archive of the exact live directory:

   ```text
   /home/jg046600/tmp/filthyfilter-before-<COMMIT>.tar.gz
   ```

6. Extract the release into `/home/jg046600/www_root_filthyfilter_sk`, then
   set directories to mode `755` and files to `644`. Do not remove the whole
   document root.

   ```bash
   tar -xzf /home/jg046600/tmp/filthyfilter-release-<COMMIT>.tar.gz -C /home/jg046600/www_root_filthyfilter_sk
   find /home/jg046600/www_root_filthyfilter_sk -type d -exec chmod 755 {} +
   find /home/jg046600/www_root_filthyfilter_sk -type f -exec chmod 644 {} +
   ```
7. Verify the expected release marker on the server and confirm every newly
   added large asset with `test -s` or `wc -c`.
8. Verify publicly over HTTPS. Use a commit-specific query parameter when
   checking changed assets to avoid a false result from browser or CDN cache:

   ```text
   https://filthyfilter.sk/js/main.js?deploy=<COMMIT>
   ```

9. Keep the server rollback archive until the deployment has been accepted.
   Delete only the exact local temporary release archive after verification.

## Last verified deployment

- Date: 2026-09-06
- Commit: `74f9eda`
- Target: `https://filthyfilter.sk/` and `https://dev.filthyfilter.sk/`
- Change: the bacteria replaces the old `FF` mark inside the pages as well, in
  the header, the footer and the review card on the case page.
- Verification on the live site: `assets/mark-bacteria.png` returns `200` at
  7,444 bytes as `image/png` on both hosts. The homepage references it twice
  and the case page three times, all loaded, all with an empty `alt`. The
  footer keeps its three items on one row. `assets/favicon.svg` returns `404`
  and no page still asks for it. No horizontal scroll, no console errors.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-74f9eda.tar.gz`
- SSH port used: 22635.
- Note: `tar -x` only adds and overwrites, so a file deleted in the repository
  survives on the server. `assets/favicon.svg` had to be removed by hand on
  both roots. Any future deletion needs the same step.

### Mail

Checked on 5 September 2026. `filthyfilter.sk` has MX records pointing at
WebHouse's six mail servers, the same set as `whispair.sk`, and an SPF record
of `v=spf1 a mx include:_spf.webhouse.sk -all`. Both `info@filthyfilter.sk` and
`postmaster@filthyfilter.sk` exist and are active in the hosting panel.

Delivery itself is still unproven: the mailbox reports 0.0 MB, so nothing has
arrived yet. Send a real message from an outside account before relying on the
address, since it is published on the site and used by the enquiry builder's
e-mail button.

### TLS

Resolved on 2026-09-05. A Let's Encrypt certificate for `filthyfilter.sk` was
issued at 10:32 UTC and covers the dev subdomain as well. HTTP now answers
`301` to the HTTPS address on both hosts, so always verify over `https://`;
plain HTTP checks will only show you the redirect.

### Previous deployment

- Date: 2026-08-28
- Commit: `8c86d29`
- Target: `https://whispair.sk/filthyfilter/`
- Change: delayed floating background-music prompt
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-8c86d29.tar.gz`

The old subpath still serves that release. Decide separately whether to
redirect it to the new domain or remove it.
