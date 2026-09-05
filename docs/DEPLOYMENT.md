# FilthyFilter production deployment

## Target

- Public URL: `https://filthyfilter.sk/`
- Server: `93.184.77.193`
- SSH user: `jg046600`
- Remote document root: `/home/jg046600/www_root_filthyfilter_sk`
- SSH identity: `%USERPROFILE%\.ssh\id_ed25519_whispair`
- SSH port: obtain the currently active port from WebHouse before deployment.
  The port is temporary; do not assume that the last used value is still valid.

`filthyfilter.sk` was registered on 5 September 2026 and is parked on the same
WebHouse account as the whispAir projects. Its own document root
`www_root_filthyfilter_sk` was created by WebHouse and initially contained only
the `webhouse.html` placeholder. The site is served from the root of that
domain, so no path prefix applies and every asset reference stays relative.

The older location `https://whispair.sk/filthyfilter/`
(`/home/jg046600/www_root_whispair_sk/filthyfilter`) still holds the previous
release. Decide separately whether to leave it, redirect it to the new domain,
or remove it; that is not part of this deployment.

The `_sub_whispair_sk` and `_sub_filthyfilter_sk` directories are only for
subdomains and are not deployment targets for this site.

## Staging — dev.filthyfilter.sk

- Public URL: `http://dev.filthyfilter.sk/`
- Remote document root: `/home/jg046600/_sub_filthyfilter_sk/dev`

Subdomains on this account live at `_sub_<domain>/<name>`, the same convention
as `dev.whispair.sk`. DNS already resolves every subdomain to the server and
Apache picks the directory up as soon as it exists, so no control-panel step
was needed. Before the directory existed, `dev.filthyfilter.sk` simply served
the main document root.

The staging copy is the production release with three differences, and they
have to be reapplied on every staging deploy:

1. `robots.txt` is replaced with a blanket `Disallow: /`.
2. Both HTML documents get `<meta name="robots" content="noindex, nofollow">`
   after the viewport meta.
3. `sitemap.xml` is left out of the package.

The canonical links keep pointing at `https://filthyfilter.sk/`, so a crawler
that reaches staging anyway is told where the real page is.

`scripts` for this are not committed; the staging package is built by copying
`index.html`, `robots.txt`, `assets/`, `css/`, `js/` and `hall/`, applying the
three changes above, then following the same upload, extract and chmod steps as
production but against the staging root.

### Last staging deploy

- Date: 2026-09-05
- Commit: `7e3a91b`
- Change: three-panel quick pick in the services section.
- Verification: `/`, `js/main.js`, `css/styles.css`, the case page, the
  before/after image, the favicon and `backgroundMusic.mp3` all returned `200`.
  `sitemap.xml` correctly returned `404`. `robots.txt` served the blanket
  disallow and the homepage carried the noindex meta. In the browser: three
  quick-pick panels with the three accent colours, two secondary cards, seven
  FAQ items, canonical on the live domain, no horizontal scroll. Production on
  `filthyfilter.sk` was untouched and still serves commit `cf5b605`.

## Authentication note

The FTP credentials in `D:\whispAir-IT\whispair-api\.env` can access application
subdomain roots, but do not have access to `www_root_whispair_sk`. Production
FilthyFilter deployment therefore uses the dedicated SSH key above. Do not copy
credentials or private keys into this repository.

## Release contents

This is a static site. Package only these public paths from the repository root:

```text
index.html
robots.txt
sitemap.xml
assets/
css/
js/
hall/
```

Do not publish `.git`, `docs`, `tmp`, `README.md`, `CONTEXT.md`, `CLAUDE.md`, or local tooling.

## Deployment procedure

Replace `<PORT>` with the active WebHouse SSH port and `<COMMIT>` with the
deployed Git commit.

1. Confirm the working tree, tests and pushed commit.
2. Create a clean local archive:

   ```powershell
   tar.exe -czf "tmp\filthyfilter-release-<COMMIT>.tar.gz" index.html robots.txt sitemap.xml assets css js hall
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

- Date: 2026-09-05
- Commit: `cf5b605`
- Target: `https://filthyfilter.sk/`, document root
  `/home/jg046600/www_root_filthyfilter_sk`
- Change: first release on the new domain. Stage 2 of the redesign, the
  removal of the Dutch language layer, and the move from the
  `whispair.sk/filthyfilter/` subpath to the root of `filthyfilter.sk`.
- Verification: `http://filthyfilter.sk/` returned HTTP `200` and 54,517 bytes,
  matching the released `index.html`. `js/main.js`, `css/styles.css`,
  `sitemap.xml`, `robots.txt` and the case page all returned `200`. `backgroundMusic.mp3` is 13,927,582 bytes and
  `evidence-reel.mp4` is 3,651,056 bytes on disk. In the browser: Slovak
  default, both language buttons present, zero `data-nl` attributes, five
  service cards, seven FAQ items, the prefilled WhatsApp message with correct
  diacritics, canonical `https://filthyfilter.sk/`, no horizontal scroll, and
  `before-after.jpg` loading at 1200 by 674 pixels.
- The WebHouse placeholder `webhouse.html` was deleted from the root after the
  site was confirmed live. It is preserved in the rollback archive.
- The `steden/` directory of Dutch city redirects was removed from the release
  and from the live root on the same day. Those paths held old
  `filthyfilter.nl` URLs and never existed on this domain, so there was nothing
  for them to preserve. `/steden/` and `/steden/eindhoven/` now return `404`.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-cf5b605.tar.gz`

### Open item — TLS certificate

`https://filthyfilter.sk/` currently serves WebHouse's own wildcard
certificate, `CN=*.webhouse.sk`, which does not cover this domain, so browsers
show a name mismatch warning. HTTP works correctly. A certificate for
`filthyfilter.sk` has to be issued from the WebHouse control panel; it cannot
be done over SSH. Until then, do not advertise the `https://` address.

### Previous deployment

- Date: 2026-08-28
- Commit: `8c86d29`
- Target: `https://whispair.sk/filthyfilter/`
- Change: delayed floating background-music prompt
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-8c86d29.tar.gz`

The old subpath still serves that release. Decide separately whether to
redirect it to the new domain or remove it.
