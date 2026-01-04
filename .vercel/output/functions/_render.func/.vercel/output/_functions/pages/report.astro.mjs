/* empty css                                 */
import { a as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CesQvfV9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_I5HwLE2N.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Report = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Your Solar Report | SolarMath", "data-astro-cid-5mrwl5tb": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div id="report-root" data-astro-cid-5mrwl5tb> <div class="max-w-xl mx-auto px-6 py-20 text-center" data-astro-cid-5mrwl5tb> <div class="text-4xl mb-4" data-astro-cid-5mrwl5tb>⏳</div> <p class="text-slate-600" data-astro-cid-5mrwl5tb>Loading your report...</p> </div> </div> ` })}  `;
}, "C:/Users/Jay/Trawl/solarcalc/src/pages/report.astro", void 0);

const $$file = "C:/Users/Jay/Trawl/solarcalc/src/pages/report.astro";
const $$url = "/report";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Report,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
