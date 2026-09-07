# FilthyFilter production deployment

## Target

- Public URL: `https://filthyfilter.sk/`
- Server: `93.184.77.193`
- SSH user: `jg046600`
- Remote document root: `/home/jg046600/www_root_filthyfilter_sk`
- SSH identity: `%USERPROFILE%\.ssh\id_ed25519_whispair`
- SSH port: `22418`, confirmed by the user on 2026-09-07 (119-minute active window).
  The port is temporary; reconfirm if it stops working.
- Deploy changes to dev first; production is a separate release.

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
   after the viewport meta. There are four of them as of 7 September 2026:
   the homepage, both landing pages and the case file. Apply it by globbing the
   package for `*.html` rather than by listing paths, or the next page added will
   quietly go out indexable.
3. `sitemap.xml` is left out of the package.

The canonical links keep pointing at `https://filthyfilter.sk/`, so a crawler
that reaches staging anyway is told where the real page is.

`scripts` for this are not committed; the staging package is built by copying
`index.html`, `robots.txt`, the root icon files, `site.webmanifest`, `assets/`,
`css/`, `js/`, `hall/`, `cistenie-klimatizacie/` and `servis-klimatizacie/`,
applying the three changes above, then following the same upload, extract and
chmod steps as production but against the staging root.

`.htaccess` is deliberately left out of the staging package. Its only rule
redirects the production `www` host, which never reaches this document root, so
shipping it here would add a file that can only ever do nothing or go wrong.

### Last staging deploy

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
enquiry never reaches the real field inbox. The mapping lives in `apiBase()` in
`js/main.js`.

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

Measurement is dormant until `TAG_ID` in `js/consent.js` is filled in. While it
is empty the page loads no Google script, sets no cookie and shows no consent
banner.

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

1. Confirm the working tree, tests and pushed commit.
2. Create a clean local archive:

   ```powershell
   tar.exe -czf "tmp\filthyfilter-release-<COMMIT>.tar.gz" .htaccess index.html robots.txt sitemap.xml favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png icon-192.png icon-512.png icon-192-maskable.png icon-512-maskable.png site.webmanifest assets css js hall
   ```

3. Upload the archive to the server staging directory:

   ```powershell
   scp -i "$env:USERPROFILE\.ssh\id_ed25519_whispair" -P <PORT> -o BatchMode=yes `
     "tmp\filthyfilter-release-<COMMIT>.tar.gz" `
     "jg046600@93.184.77.193:/home/jg046600/tmp/filthyfilter-release-<COMMIT>.tar.gz"
   ```

4. Before extraction, create a rollback archive of the exact live directory:

   ```text
   /home/jg046600/tmp/filthyfilter-before-<COMMIT>.tar.gz
   ```

5. Extract the release into `/home/jg046600/www_root_filthyfilter_sk`, then
   set directories to mode `755` and files to `644`. Do not remove the whole
   document root.

   ```bash
   tar -xzf /home/jg046600/tmp/filthyfilter-release-<COMMIT>.tar.gz -C /home/jg046600/www_root_filthyfilter_sk
   find /home/jg046600/www_root_filthyfilter_sk -type d -exec chmod 755 {} +
   find /home/jg046600/www_root_filthyfilter_sk -type f -exec chmod 644 {} +
   ```
6. Verify the expected release marker on the server and confirm every newly
   added large asset with `test -s` or `wc -c`.
7. Verify publicly over HTTPS. Use a commit-specific query parameter when
   checking changed assets to avoid a false result from browser or CDN cache:

   ```text
   https://filthyfilter.sk/js/main.js?deploy=<COMMIT>
   ```

8. Keep the server rollback archive until the deployment has been accepted.
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
