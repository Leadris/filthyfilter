// Run with node --test tests/browser.test.cjs; requires Playwright and Chromium.
// FF_BROWSER_EXECUTABLE optionally points to a locally installed Chrome/Edge.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
let browser, server, base;
const root = path.resolve(__dirname, '..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
before(async()=>{
  server=http.createServer((req,res)=>{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(name.endsWith('/'))name+='index.html';
    const target=path.resolve(root,'.'+name);
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(data);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,executablePath:process.env.FF_BROWSER_EXECUTABLE||undefined});
});
after(async()=>{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));});
async function setup(t,feed={success:true,servicePackages:[]},options={}) {
  const context=await browser.newContext(options);
  t.after(()=>context.close());
  const page=await context.newPage();
  const errors=[],google=[],leads=[],unexpected=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
    const req=route.request(),url=req.url();
    if(url.startsWith(base))return route.continue();
    if(url.includes('/service-packages/published')){
      if(typeof feed==='function')return feed(route);
      return route.fulfill({json:feed});
    }
    if(url.includes('/api/v1/leads')){leads.push(req.postDataJSON());return route.fulfill({json:{success:true}});}
    if(url.startsWith('https://www.googletagmanager.com/')){google.push(url);return route.fulfill({contentType:'text/javascript',body:'/* measurement stub: no real events sent */'});}
    unexpected.push(url);return route.abort();
  });
  t.after(()=>{assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);});
  return {context,page,google,leads};
}
const pkg=(code,price,extras={})=>({packageCode:code,priceAmount:price,currency:'EUR',priceVatMode:'vat_included',...extras});
async function tick(page){await page.waitForFunction(()=>window.ffConsent && window.ffAttribution);}
async function submit(page){
  await page.selectOption('#inq-service','nastenna');
  await page.fill('#inq-place','Senec');await page.fill('#inq-name','Browser test');
  await page.fill('#inq-email-addr','browser-test@example.invalid');
  await page.check('#inq-units-unknown');await page.click('#inq-send');
  await page.waitForFunction(()=>document.querySelector('#inq-status').textContent.includes('Dopyt je u nás'));
}

test('No consent: no Google or ad storage; enquiry works and carries no click identifiers',async t=>{
  const {page,google,leads}=await setup(t);
  await page.goto(base+'/?gclid=TEST&email=private%40example.invalid');await tick(page);
  assert.equal(google.length,0);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('ff_attr_v2')),null);
  await page.click('[data-consent="reject"]');await submit(page);
  assert.equal(leads.length,1);assert.equal(leads[0].landing_token,'ff-home');
  for(const key of ['gclid','landing_url','referrer','utm_campaign'])assert.equal(leads[0][key],undefined);
  // The answers the visitor typed are the enquiry itself, not advertising data,
  // so they travel with or without consent. Refusing measurement must not cost
  // the office the service, the town or the unit count.
  assert.equal(leads[0].business_brand,'filthyfilter');
  assert.equal(leads[0].service_key,'nastenna');
  assert.equal(leads[0].service_code,'FF-CIST-NASTENNA');
  assert.equal(leads[0].place,'Senec');
  assert.equal(leads[0].unit_count_unknown,true);
  assert.equal(leads[0].unit_count,undefined,'an unknown count must not also send a number');
  assert.equal(leads[0].express,false);
  // The town is sent as address, and deliberately left out of the composed
  // text, which omits contact details. The service is in both.
  assert.equal(leads[0].address,'Senec');
  assert.ok(leads[0].message.includes('nástennej jednotky'),'the composed text still names the service');
  assert.equal(google.length,0);
  assert.equal(await page.evaluate(()=>dataLayer.some(e=>e.event==='lead_submitted')),false);
});

test('Consent captures allowed attribution; navigation retains first touch; withdrawal clears storage and stops tag',async t=>{
  const {page,context,google}=await setup(t);
  await page.goto(base+'/?gclid=TEST&utm_campaign=clean&email=private%40example.invalid#contact');
  await page.click('[data-consent="accept"]');await page.waitForFunction(()=>ffAttribution.isPaid());
  let attr=await page.evaluate(()=>ffAttribution.get());assert.equal(attr.gclid,'TEST');
  assert.equal(attr.landing_url,base+'/');assert.equal(google.length,1);
  await page.goto(base+'/cistenie-klimatizacie/?gclid=SECOND');
  attr=await page.evaluate(()=>ffAttribution.get());assert.equal(attr.gclid,'TEST');assert.equal(attr.landing_token,'ff-cistenie');
  await context.addCookies([{name:'_ga',value:'test',url:base+'/'}]);
  await page.locator('[data-consent-settings]').first().click();
  await Promise.all([page.waitForEvent('load'),page.click('[data-consent="reject"]')]);
  assert.equal(await page.evaluate(()=>ffConsent.allowed()),false);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('ff_attr_v2')),null);
  assert.equal((await context.cookies()).some(c=>c.name==='_ga'),false);
  const requests=google.length;await page.reload();assert.equal(google.length,requests);
});

test('A Meta click identifier is captured like a Google one and reaches the enquiry',async t=>{
  const {page,leads}=await setup(t);
  await page.goto(base+'/?fbclid=FB-TEST-1');await tick(page);
  // Meta is the first paid channel, so fbclid has to survive consent, first
  // touch and a page change exactly the way gclid already does.
  assert.equal(await page.evaluate(()=>ffAttribution.isPaid()),false,'nothing is kept before consent');
  await page.click('[data-consent="accept"]');await page.waitForFunction(()=>ffAttribution.isPaid());
  assert.equal(await page.evaluate(()=>ffAttribution.get().fbclid),'FB-TEST-1');
  await page.goto(base+'/servis-klimatizacie/?fbclid=FB-SECOND');
  assert.equal(await page.evaluate(()=>ffAttribution.get().fbclid),'FB-TEST-1','first touch wins');
  await submit(page);
  assert.equal(leads[0].fbclid,'FB-TEST-1');
  // The platform is decided by the API from the identifiers it was given; a
  // page that could name it could mislabel a Google click as a Meta one.
  assert.equal(leads[0].platform,undefined);
});

test('Expired and legacy consent do not authorise tracking; malformed query does not break page',async t=>{
  const {page,context,google}=await setup(t);
  await context.addInitScript(()=>{
    localStorage.setItem('ff_consent_v1','yes');
    localStorage.setItem('ff_consent_v2',JSON.stringify({version:'2026-09-07',accepted:true,at:Date.now()-181*86400000}));
    sessionStorage.setItem('ff_attr_v1',JSON.stringify({gclid:'LEGACY'}));
  });
  await page.goto(base+'/?%E0%A4%A=bad');await tick(page);
  assert.equal(await page.locator('.consent').count(),1);assert.equal(google.length,0);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('ff_attr_v1')),null);
  await page.click('[data-consent="accept"]');assert.equal(await page.evaluate(()=>ffAttribution.isPaid()),false);
});

test('Portal prices update all translated instances and metadata without losing form input',async t=>{
  let release;const ready=new Promise(r=>release=r);
  const {page}=await setup(t,async route=>{await ready;return route.fulfill({json:{success:true,servicePackages:[pkg('FF-CIST-NASTENNA',89.5),pkg('FF-CIST-KAZETOVA',139),pkg('FF-UDRZBA',59),pkg('FF-DIAGNOSTIKA',69),pkg('FF-EXPRES-24H',55)]}});});
  await page.goto(base+'/cistenie-klimatizacie/',{waitUntil:'domcontentloaded'});
  await page.click('[data-consent="reject"]');await page.fill('#inq-name','Keep this');
  if(await page.locator('#inq-express').count())await page.check('#inq-express');
  await page.click('[data-lang="en"]');release();
  await page.waitForFunction(()=>document.title.includes('€89.50'));
  assert.equal(await page.inputValue('#inq-name'),'Keep this');
  if(await page.locator('#inq-express').count())assert.match(await page.inputValue('#inq-preview'),/€55/);
  const snippets=await page.locator('[data-en*="{{p-nastenna}}"]').allTextContents();assert.ok(snippets.every(x=>x.includes('€89.50')));
  await page.click('[data-lang="sk"]');assert.match(await page.title(),/89,50 €/);
  assert.equal(await page.locator('body').innerText().then(s=>s.includes('{{p-')),false);
});

test('Invalid VAT, currency, duplicate or non-numeric prices preserve fallback; valid packages update independently',async t=>{
  const feed={success:true,servicePackages:[pkg('FF-CIST-NASTENNA',10,{priceVatMode:'vat_excluded'}),pkg('FF-CIST-KAZETOVA',1,{currency:'USD'}),pkg('FF-UDRZBA',1),pkg('FF-UDRZBA',2),pkg('FF-DIAGNOSTIKA',65),pkg('OTHER',1)]};
  const {page}=await setup(t,feed);await page.goto(base+'/');
  await page.waitForFunction(()=>document.querySelector('[data-sk*="{{p-diagnostika}}"]')?.textContent.includes('65 €'));
  for(const [key,value]of [['nastenna','79 €'],['kazetova','129 €'],['udrzba','49 €']]){
    assert.ok((await page.locator('[data-sk*="{{p-'+key+'}}"]' ).allTextContents()).every(x=>x.includes(value)));
  }
});

test('Unavailable API, invalid JSON, empty feed and timeout leave working fallbacks',async t=>{
  for(const mode of ['http','json','empty','timeout']){
    const feed=async route=>{
      if(mode==='http')return route.fulfill({status:405,body:'Not deployed'});
      if(mode==='json')return route.fulfill({contentType:'application/json',body:'invalid'});
      if(mode==='timeout'){await new Promise(r=>setTimeout(r,4400));return route.fulfill({json:{success:true,servicePackages:[pkg('FF-CIST-NASTENNA',1)]}}).catch(()=>{});}
      return route.fulfill({json:{success:true,servicePackages:[]}});
    };
    const {page}=await setup(t,feed);await page.goto(base+'/cistenie-klimatizacie/',{waitUntil:'domcontentloaded'});
    if(mode==='timeout')await page.waitForTimeout(4600);
    assert.match(await page.title(),/79 €/);assert.equal(await page.locator('#inq-send').count(),1);
  }
});

test('Every public page: working privacy links, responsive layout, SK/EN and local assets',async t=>{
  for(const width of [390,1440]){
    const {page}=await setup(t,undefined,{viewport:{width,height:900},deviceScaleFactor:width===390?2:1});
    for(const route of ['/','/cistenie-klimatizacie/','/servis-klimatizacie/','/hall/trnava-la-donuteria/','/ochrana-osobnych-udajov/']){
      await page.goto(base+route);
      if(await page.locator('[data-consent="reject"]').count())await page.click('[data-consent="reject"]');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow at '+width);
      assert.ok(await page.locator('a[href*="ochrana-osobnych-udajov/"]').count());
      await page.click('[data-lang="en"]');assert.equal(await page.locator('html').getAttribute('lang'),'en');
      if(route.includes('ochrana')){assert.match(await page.locator('main').innerText(),/ADAMSON/);await page.screenshot({path:path.join(root,'tmp/privacy-'+width+'.png'),fullPage:width===1440});}
      if(route.includes('/hall/')){
        const poster=await page.locator('.case-poster__art img').evaluate(el=>({src:el.currentSrc,loaded:el.complete&&el.naturalWidth>0,opacity:getComputedStyle(el.parentElement).opacity}));
        assert.match(poster.src,/\.webp$/);assert.ok(poster.loaded);assert.equal(poster.opacity,'0.5');
        await page.screenshot({path:path.join(root,'tmp/poster-'+width+'.png')});
      }
    }
  }
});
