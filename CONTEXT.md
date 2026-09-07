# FilthyFilter by whispAir — Project Context

## Current handoff — 2026-09-05

**Read `docs/REDESIGN_PLAN.md` first.** It is the approved implementation brief, checklist and live handoff for Codex/Claude; see also `CLAUDE.md`. It supersedes historical decisions below. User instructions take precedence.

- Keep the existing dark copper/gold HUD visual design and humor. Brand: **FilthyFilter by whispAir**; do not use Klimuj.sk or Dutch business details.
- Main market: Slovakia. Bratislava, Trnava, Nitra and 20 km around them; availability and travel costs by address.
- Phone/WhatsApp: +421 902 279 094. Email: info@filthyfilter.sk (delivery still unverified).
- Slovak source HTML and default language. **The site ships SK and EN only**; the Dutch layer was removed on 2026-09-05. Keep the remembered manual selection; both languages describe the same Slovak service area.
- Static HTML/CSS/JS. Shared contact destinations are in `CONTACT` in `js/main.js`, with functional matching HTML fallback links.
- The legacy `steden/` directory was deleted on 2026-09-05. It held old filthyfilter.nl URLs that never existed on the new domain. La Donuteria remains a case study. Collaboration section is deferred.
- Baseline tag: `baseline-v1` on `99b956c85f6c857475340ad7be76914f7d24f003`. Work branch: `codex/filthyfilter-redesign`.
- Production is `https://filthyfilter.sk/`, the root of its own domain on the same WebHouse account. Branch pushes do not deploy. See `docs/DEPLOYMENT.md` for the release process and the outstanding TLS certificate.
- Stages 1 and 2 are done: branding, the reordered content, service cards, proof section, FAQ, business section and the audio simplification. The full inquiry form with validation is still open. Check the plan before continuing.

## Historical baseline context

Removed on 7 September 2026. It described a trilingual site with a `steden/`
directory, Dutch contact details and Dutch as the default language. None of that
exists any more, and a confident description of a structure that is gone is worse
than no description at all. Git history before this commit still has it.

## Where to look next

| Question | Document |
| --- | --- |
| Where the project stands and what is open | `docs/STATUS.md` |
| Visual design, copy, content decisions | `docs/REDESIGN_PLAN.md` |
| Acquisition, measurement, pricing, Google Ads | `docs/MARKETING_PLAN.md` |
| How it is deployed | `docs/DEPLOYMENT.md` |
| How a case file is written | `docs/HALL_OF_FILTH_CASE_GUIDE.md` |

