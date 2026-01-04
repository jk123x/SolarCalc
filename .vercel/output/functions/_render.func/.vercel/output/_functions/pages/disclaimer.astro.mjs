/* empty css                                 */
import { a as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CesQvfV9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_I5HwLE2N.mjs';
export { renderers } from '../renderers.mjs';

const $$Disclaimer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Disclaimer | Solar EV Calculator" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-6 py-12"> <a href="/" class="text-blue-600 hover:underline text-sm mb-6 inline-block">← Back to Calculator</a> <h1 class="text-4xl font-black text-slate-900 mb-2">Disclaimer</h1> <p class="text-slate-500 text-sm mb-8">Last updated: January 2026</p> <div class="prose prose-slate max-w-none"> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">Not financial advice</h2> <p class="text-slate-600 mb-6">
The information provided by this calculator is for general informational purposes only. It does not constitute financial, investment, or professional advice. You should consult with qualified professionals before making any financial decisions regarding solar panel or battery investments.
</p> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">Estimates only</h2> <p class="text-slate-600 mb-6">
All figures, projections, and calculations are estimates based on modeled scenarios and publicly available data. Actual results will vary significantly based on your specific circumstances, including but not limited to:
</p> <ul class="text-slate-600 space-y-1 mb-6"> <li>• Your actual electricity usage patterns</li> <li>• Local weather and solar irradiance</li> <li>• Future electricity prices (which we cannot predict)</li> <li>• Equipment performance and degradation</li> <li>• Installation quality and costs</li> <li>• Changes to government rebates and policies</li> </ul> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">No guarantees</h2> <p class="text-slate-600 mb-6">
We make no guarantees about the accuracy, completeness, or reliability of any information on this website. The solar and battery markets change rapidly, and information may become outdated.
</p> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">Your responsibility</h2> <p class="text-slate-600 mb-6">
You are responsible for verifying any information before making decisions. We recommend:
</p> <ul class="text-slate-600 space-y-1 mb-6"> <li>• Getting multiple quotes from accredited installers</li> <li>• Consulting with a financial advisor for major investments</li> <li>• Checking current rebate eligibility with official government sources</li> <li>• Reading product warranties and specifications carefully</li> </ul> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">Limitation of liability</h2> <p class="text-slate-600 mb-6">
To the maximum extent permitted by law, we exclude all liability for any loss or damage arising from your use of this website or reliance on its content. This includes direct, indirect, incidental, or consequential damages.
</p> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">External links</h2> <p class="text-slate-600 mb-6">
This website may contain links to external sites. We are not responsible for the content or accuracy of external websites.
</p> <h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">Australian Consumer Law</h2> <p class="text-slate-600 mb-6">
Nothing in this disclaimer excludes or limits any rights you may have under the Australian Consumer Law or other legislation that cannot be excluded or limited by law.
</p> </div> </div> ` })}`;
}, "C:/Users/Jay/Trawl/solarcalc/src/pages/disclaimer.astro", void 0);

const $$file = "C:/Users/Jay/Trawl/solarcalc/src/pages/disclaimer.astro";
const $$url = "/disclaimer";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Disclaimer,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
