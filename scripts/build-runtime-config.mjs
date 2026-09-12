import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'config', 'environments.json');
const outputPath = path.join(root, 'js', 'runtime-config.js');
const hosts = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const publicPages = [
  'index.html',
  'cistenie-klimatizacie/index.html',
  'servis-klimatizacie/index.html',
  'ochrana-osobnych-udajov/index.html',
  'hall/trnava-la-donuteria/index.html',
];

for (const [host, config] of Object.entries(hosts)) {
  if (!['local', 'development', 'production'].includes(config.environment)) {
    throw new Error(`Invalid environment for ${host}`);
  }
  if (!/^https:\/\//.test(config.apiBase)) {
    throw new Error(`apiBase for ${host} must use HTTPS`);
  }
  if (config.gtmContainerId && !/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId)) {
    throw new Error(`Invalid GTM container id for ${host}`);
  }
  // A Meta pixel id is a plain number, roughly 15 to 16 digits. Empty means the
  // pixel stays dormant, which is the state until Events Manager hands one over.
  if (config.metaPixelId && !/^[0-9]{13,17}$/.test(config.metaPixelId)) {
    throw new Error(`Invalid Meta pixel id for ${host}`);
  }
}

for (const relativePath of publicPages) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const runtimeAt = html.indexOf('runtime-config.js');
  const consumerPositions = ['consent.js', 'main.js']
    .map((name) => html.indexOf(name))
    .filter((position) => position >= 0);
  if (runtimeAt < 0 || consumerPositions.some((position) => runtimeAt > position)) {
    throw new Error(`${relativePath} must load runtime-config.js before consent.js/main.js`);
  }
}

const generated = `/* Generated from config/environments.json. Public values only. */
(function () {
  "use strict";
  var hosts = ${JSON.stringify(hosts, null, 2)};
  var selected = hosts[String(location.hostname || "").toLowerCase()] || {
    environment: "unsupported",
    apiBase: "",
    gtmContainerId: "",
    metaPixelId: ""
  };
  window.FILTHYFILTER_CONFIG = Object.freeze(selected);
})();
`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  if (current !== generated) {
    console.error('js/runtime-config.js is stale; run npm run build:config');
    process.exit(1);
  }
  console.log('runtime config is current');
} else {
  fs.writeFileSync(outputPath, generated, 'utf8');
  console.log('generated js/runtime-config.js');
}
