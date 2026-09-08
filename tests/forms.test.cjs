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

// The floating bar is the whole mobile contact surface, and WhatsApp is where
// the Meta click-to-WhatsApp campaign lands. Losing the button on one page, or
// losing the origin line out of its href, is silent: the bar still looks right
// and the API just stops being able to tell whose lead it is.
test('the mobile bar offers the same three channels on all three pages', () => {
  for (const page of PAGES) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const bar = html.match(/<div class="mobile-cta">[\s\S]*?<\/div>/);
    assert.ok(bar, `${page}: no mobile bar found`);
    const links = bar[0].match(/<a\b[^>]*>/g) || [];
    assert.equal(links.length, 3, `${page}: the bar should hold three buttons`);

    const phone = links.filter((a) => attr(a, 'data-contact') === 'phone');
    const wa = links.filter((a) => attr(a, 'data-contact') === 'whatsapp');
    const form = links.filter((a) => attr(a, 'href') === '#contact');
    assert.equal(phone.length, 1, `${page}: the bar lost its phone button`);
    assert.equal(form.length, 1, `${page}: the bar lost its link to the form`);
    assert.equal(wa.length, 1, `${page}: the bar lost its WhatsApp button`);

    // js/main.js rewrites this href per language; the static one is what a
    // visitor without JS gets, so it has to say the same thing.
    assert.match(
      attr(wa[0], 'href'),
      /wa\.me\/\d+\?text=[^"]*filthyfilter\.sk/,
      `${page}: the WhatsApp button must open with the line naming the site, ` +
        'or whispair-api cannot tell the enquiry from a unit sale.'
    );
    for (const link of links) {
      assert.ok(attr(link, 'data-sk') && attr(link, 'data-en'), `${page}: a bar button is not translated`);
    }

    // The same goes for every other WhatsApp button on the page. Without JS
    // a bare number opens an empty message, which the API cannot attribute.
    const all = (html.match(/<a\b[^>]*data-contact="whatsapp"[^>]*>/g) || []);
    assert.ok(all.length, `${page}: no WhatsApp buttons at all`);
    for (const link of all) {
      assert.match(
        attr(link, 'href'),
        /wa\.me\/\d+\?text=[^"]*filthyfilter\.sk/,
        `${page}: a WhatsApp button falls back to a bare number: ${attr(link, 'data-sk')}`
      );
    }
  }
});
