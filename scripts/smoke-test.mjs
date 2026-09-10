// Post-deploy smoke test for the live site. Network-dependent on purpose, which
// is why it is NOT part of `npm test`: that suite must stay offline and
// deterministic. Run it after every deploy.
//
//   npm run smoke            # production
//   npm run smoke:staging    # dev.filthyfilter.sk -> api-dev
//
// Why this exists. The enquiry form is the only thing on this site that has to
// reach a server, and when it breaks nothing reports it: the visitor sees an
// error, the lead is gone, and the logs show a page view like any other. That
// exact failure ran for months on the portal's own landing page, which posted
// to a path that stopped existing when the API moved to its own host. Nothing
// here is a substitute for the browser tests; this only asks whether the live
// lead path still works end to end.
//
// Every request below is read-only or a no-op. The one POST fills the honeypot
// field, so the API answers 202 and deliberately stores nothing.

const TARGETS = {
  production: {
    site: 'https://filthyfilter.sk',
    api: 'https://api.whispair.sk',
    // The apex is the only website origin in the production CORS allowlist.
    wwwRedirect: 'https://www.filthyfilter.sk',
  },
  staging: {
    site: 'https://dev.filthyfilter.sk',
    api: 'https://api-dev.whispair.sk',
    wwwRedirect: null,
  },
};

const PAGES = ['/', '/cistenie-klimatizacie/', '/servis-klimatizacie/'];

const targetName = process.argv[2] === 'staging' ? 'staging' : 'production';
const target = TARGETS[targetName];

let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
  } catch (error) {
    console.error(`  FAIL  ${name}\n         ${error.message}`);
    failures += 1;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log(`filthyfilter smoke test -> site ${target.site} / api ${target.api}\n`);

for (const page of PAGES) {
  await check(`page ${page} serves the enquiry form`, async () => {
    const response = await fetch(target.site + page);
    assert(response.status === 200, `expected HTTP 200, got ${response.status}`);
    const html = await response.text();
    assert(html.includes('id="inquiry-form"'), 'no element with id="inquiry-form" in the response');
  });
}

await check('js/main.js points at the right API host', async () => {
  const response = await fetch(`${target.site}/js/main.js`);
  assert(response.status === 200, `expected HTTP 200, got ${response.status}`);
  const source = await response.text();
  const host = new URL(target.api).host;
  assert(source.includes(host), `served main.js never mentions ${host}`);
  assert(source.includes('/api/v1/leads'), 'served main.js does not post to /api/v1/leads');
});

if (target.wwwRedirect) {
  await check('www redirects to the apex', async () => {
    // Not cosmetic. js/main.js maps the www host to the production API, but the
    // production CORS allowlist contains only the apex origin, so a page that
    // actually ran on www would have its enquiry blocked by the browser and the
    // lead lost with no server-side trace. The redirect is what keeps that from
    // ever happening; if it goes, this must fail loudly rather than quietly.
    const response = await fetch(target.wwwRedirect + '/', { redirect: 'manual' });
    assert(
      response.status >= 300 && response.status < 400,
      `expected a redirect, got HTTP ${response.status}`,
    );
    const location = response.headers.get('location') || '';
    assert(
      location.startsWith(target.site),
      `redirects to '${location}', expected the apex ${target.site}`,
    );
  });
}

await check('API allows the site origin to post a lead', async () => {
  const response = await fetch(`${target.api}/api/v1/leads`, {
    method: 'OPTIONS',
    headers: {
      Origin: target.site,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert(response.status === 204, `preflight expected HTTP 204, got ${response.status}`);
  const allowed = response.headers.get('access-control-allow-origin');
  assert(allowed, 'preflight returned no Access-Control-Allow-Origin header');
  assert(
    allowed === '*' || allowed === target.site,
    `preflight allows '${allowed}', but the site origin is '${target.site}'`,
  );
});

await check('lead intake accepts a honeypot post (stores nothing)', async () => {
  const response = await fetch(`${target.api}/api/v1/leads`, {
    method: 'POST',
    headers: { Origin: target.site, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'smoke',
      message: 'smoke',
      company: 'bot', // honeypot: the API pretends success and writes no row
      business_brand: 'filthyfilter',
    }),
  });
  assert(response.status === 202, `expected HTTP 202, got ${response.status}`);
  const body = await response.json();
  assert(body.success === true, `expected {"success":true}, got ${JSON.stringify(body)}`);
});

console.log('');
if (failures > 0) {
  console.error(`Smoke test FAILED: ${failures} failure(s).`);
  process.exit(1);
}
console.log('Smoke test passed.');
