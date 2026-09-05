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
steden/
```

Do not publish `.git`, `docs`, `tmp`, `README.md`, `CONTEXT.md`, `CLAUDE.md`, or local tooling.

## Deployment procedure

Replace `<PORT>` with the active WebHouse SSH port and `<COMMIT>` with the
deployed Git commit.

1. Confirm the working tree, tests and pushed commit.
2. Create a clean local archive:

   ```powershell
   tar.exe -czf "tmp\filthyfilter-release-<COMMIT>.tar.gz" index.html robots.txt sitemap.xml assets css js hall steden
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

- Date: 2026-08-28
- Commit: `8c86d29`
- Target: `https://whispair.sk/filthyfilter/` (previous location)
- Change: delayed floating background-music prompt
- Verification: live JavaScript contained `ff_sound_v2` and the six-second
  delay; `backgroundMusic.mp3` returned HTTP `200`, `audio/mpeg`, and
  `13,927,582` bytes.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-8c86d29.tar.gz`

## Pending deployment — commit `cf5b605`

Prepared on 5 September 2026 and staged on the server, but **not extracted**.
The extraction step was refused locally by the agent permission classifier, so
the document root still holds only `webhouse.html`.

Already done:

- Local archive `tmp/filthyfilter-release-cf5b605.tar.gz`, 21,418,883 bytes,
  36 entries.
- Uploaded to `/home/jg046600/tmp/filthyfilter-release-cf5b605.tar.gz`.
- Rollback archive of the untouched root at
  `/home/jg046600/tmp/filthyfilter-before-cf5b605.tar.gz`.

Remaining: run the extraction and permission commands from step 5, then verify
over HTTPS per steps 6 and 7. Delete `webhouse.html` from the root once the
site is confirmed live.
