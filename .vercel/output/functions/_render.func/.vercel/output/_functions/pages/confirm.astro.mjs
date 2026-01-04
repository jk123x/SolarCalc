/* empty css                                 */
import { c as createAstro, a as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/astro/server_CesQvfV9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_I5HwLE2N.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://solarmath.com.au");
const $$Confirm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Confirm;
  const status = Astro2.url.searchParams.get("status");
  const reportData = Astro2.url.searchParams.get("data");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Email Confirmed | SolarMath" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-xl mx-auto px-6 py-20 text-center"> ${status === "success" && renderTemplate`<div> <div class="text-6xl mb-6">✅</div> <h1 class="text-3xl font-black text-slate-900 mb-4">You're confirmed!</h1> <p class="text-slate-600 mb-8">
Your personalised 25-year solar report is on its way to your inbox. 
          You can also view it right now:
</p> <a${addAttribute(`/report?data=${reportData}`, "href")} class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition">
View My Report
</a> </div>`} ${status === "invalid" && renderTemplate`<div> <div class="text-6xl mb-6">🤔</div> <h1 class="text-3xl font-black text-slate-900 mb-4">Invalid or expired link</h1> <p class="text-slate-600 mb-8">
This confirmation link isn't valid. It may have already been used or expired.
</p> <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition">
Run a New Calculation
</a> </div>`} ${status === "error" && renderTemplate`<div> <div class="text-6xl mb-6">😕</div> <h1 class="text-3xl font-black text-slate-900 mb-4">Something went wrong</h1> <p class="text-slate-600 mb-8">
We couldn't confirm your email. Please try again or contact us if the problem persists.
</p> <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition">
Back to Calculator
</a> </div>`} ${!status && renderTemplate`<div> <div class="text-6xl mb-6">📧</div> <h1 class="text-3xl font-black text-slate-900 mb-4">Check your email</h1> <p class="text-slate-600 mb-8">
We've sent you a confirmation link. Click it to get your personalised solar report.
</p> <p class="text-sm text-slate-400">
Didn't get it? Check your spam folder.
</p> </div>`} </div> ` })}`;
}, "C:/Users/Jay/Trawl/solarcalc/src/pages/confirm.astro", void 0);

const $$file = "C:/Users/Jay/Trawl/solarcalc/src/pages/confirm.astro";
const $$url = "/confirm";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Confirm,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
