# FilthyFilter production deployment

## Target

- Public URL: `https://whispair.sk/filthyfilter/`
- Server: `93.184.77.193`
- SSH user: `jg046600`
- Remote document root: `/home/jg046600/www_root_whispair_sk/filthyfilter`
- SSH identity: `%USERPROFILE%\.ssh\id_ed25519_whispair`
- SSH port: obtain the currently active port from WebHouse before deployment.
  The port is temporary; do not assume that the last used value is still valid.

The main `whispair.sk` document root is `www_root_whispair_sk`. The
`_sub_whispair_sk` directory is only for subdomains and is not the deployment
target for this site.

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

5. Extract the release into
   `/home/jg046600/www_root_whispair_sk/filthyfilter`, then set directories to
   mode `755` and files to `644`. Do not remove the whole document root.
6. Verify the expected release marker on the server and confirm every newly
   added large asset with `test -s` or `wc -c`.
7. Verify publicly over HTTPS. Use a commit-specific query parameter when
   checking changed assets to avoid a false result from browser or CDN cache:

   ```text
   https://whispair.sk/filthyfilter/js/main.js?deploy=<COMMIT>
   ```

8. Keep the server rollback archive until the deployment has been accepted.
   Delete only the exact local temporary release archive after verification.

## Last verified deployment

- Date: 2026-08-28
- Commit: `8c86d29`
- Change: delayed floating background-music prompt
- Verification: live JavaScript contained `ff_sound_v2` and the six-second
  delay; `backgroundMusic.mp3` returned HTTP `200`, `audio/mpeg`, and
  `13,927,582` bytes.
- Rollback archive:
  `/home/jg046600/tmp/filthyfilter-before-8c86d29.tar.gz`
