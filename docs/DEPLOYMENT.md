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
- Commit: `64aa2e1`
- Target: `https://filthyfilter.sk/` and `https://dev.filthyfilter.sk/`
- Change: every section heading lifted out of its frame, matching the Pre firmy
  layout the user picked.
- Verification over HTTPS on both hosts: `200`, serving `v=whispair-frames-1`,
  and the new "Ako pracujeme" panel tag present. On the live site all nine
  sections put the heading outside the panel, the gap between heading and frame
  is a consistent 40px in each of the four changed sections, and there is no
  horizontal scroll at 1360px.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-64aa2e1.tar.gz`
- SSH port used: 22306. The port rotates every couple of hours; 22892, 22050
  and 22571 all expired earlier the same day.

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
