// The enquiry form exists three times, as three copies of the same markup, on
// the homepage and both landing pages. One js/main.js drives all three and
// binds by id, and one API reads the fields they send, so a field renamed,
// retyped or added on one page only breaks the other two silently.
//
// This compares the structure of the three forms, not their wording. A label
// may legitimately read differently on a landing page; a field name may not.
//
// Run with: node --test tests/forms.test.cjs   (no browser needed)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const PAGES = [
  'index.html',
  'cistenie-klimatizacie/index.html',
  'servis-klimatizacie/index.html',
];

function form(page) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const match = html.match(/<form\b[^>]*id="inquiry-form"[\s\S]*?<\/form>/);
  assert.ok(match, `${page}: no enquiry form found — did the id change?`);
  return match[0];
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

/** Every control in the form, described only by what the code depends on. */
function controls(markup) {
  const tags = markup.match(/<(?:input|select|textarea)\b[^>]*>/g) || [];
  return tags
    .map((tag) => ({
      id: attr(tag, 'id'),
      name: attr(tag, 'name'),
      // A number field silently turned into text still submits, and the count
      // stops being a count.
      type: attr(tag, 'type') || tag.slice(1).split(/[\s>]/)[0],
      required: /\srequired\b/.test(tag),
    }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/** The service values are the keys main.js maps to package codes. */
function services(markup) {
  const select = markup.match(/<select\b[^>]*id="inq-service"[\s\S]*?<\/select>/);
  assert.ok(select, 'the service select is missing');
  return (select[0].match(/<option\s+value="([^"]*)"/g) || []).map((o) => o.split('"')[1]);
}

test('the three enquiry forms have the same fields', () => {
  const [reference, ...rest] = PAGES.map((page) => ({ page, controls: controls(form(page)) }));

  for (const other of rest) {
    assert.deepEqual(
      other.controls,
      reference.controls,
      `${other.page} and ${reference.page} no longer collect the same fields. ` +
        'One js/main.js reads all three by id and one API reads what they send, ' +
        'so copy the change across before this ships.'
    );
  }
});

test('the three enquiry forms offer the same services', () => {
  const [reference, ...rest] = PAGES.map((page) => ({ page, services: services(form(page)) }));

  for (const other of rest) {
    assert.deepEqual(
      other.services,
      reference.services,
      `${other.page} offers different services than ${reference.page}. ` +
        'These values become the package code sent with the enquiry.'
    );
  }
});

test('every field the enquiry sends is present on all three pages', () => {
  // The names js/main.js reads and the API stores. Losing one of these on a
  // single page is the exact failure this file exists to catch.
  const REQUIRED_FIELDS = [
    'inq-service', 'inq-place', 'inq-units', 'inq-units-unknown',
    'inq-name', 'inq-phone', 'inq-email-addr', 'inq-problem', 'inq-date',
    'inq-company', // honeypot: the API drops the enquiry when it is filled
  ];

  for (const page of PAGES) {
    const ids = new Set(controls(form(page)).map((c) => c.id));
    for (const field of REQUIRED_FIELDS) {
      assert.ok(ids.has(field), `${page} is missing ${field}`);
    }
  }
});
