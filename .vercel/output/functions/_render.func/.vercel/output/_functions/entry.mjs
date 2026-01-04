import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DUqkB9jn.mjs';
import { manifest } from './manifest_Do_WhlVo.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/confirm.astro.mjs');
const _page3 = () => import('./pages/api/subscribe.astro.mjs');
const _page4 = () => import('./pages/confirm.astro.mjs');
const _page5 = () => import('./pages/disclaimer.astro.mjs');
const _page6 = () => import('./pages/methodology.astro.mjs');
const _page7 = () => import('./pages/privacy.astro.mjs');
const _page8 = () => import('./pages/report.astro.mjs');
const _page9 = () => import('./pages/what-is-tou-pricing.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/confirm.ts", _page2],
    ["src/pages/api/subscribe.ts", _page3],
    ["src/pages/confirm.astro", _page4],
    ["src/pages/disclaimer.astro", _page5],
    ["src/pages/methodology.astro", _page6],
    ["src/pages/privacy.astro", _page7],
    ["src/pages/report.astro", _page8],
    ["src/pages/what-is-tou-pricing.astro", _page9],
    ["src/pages/index.astro", _page10]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "a2ae4a3e-7bd6-441d-90ca-435b8dcfbda3",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
