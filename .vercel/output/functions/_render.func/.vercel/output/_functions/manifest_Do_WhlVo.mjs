import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BYKVQBzi.mjs';
import 'es-module-lexer';
import { g as decodeKey } from './chunks/astro/server_CesQvfV9.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/Jay/Trawl/solarcalc/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/confirm","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/confirm\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"confirm","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/confirm.ts","pathname":"/api/confirm","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/subscribe","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/subscribe\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"subscribe","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/subscribe.ts","pathname":"/api/subscribe","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/confirm","isIndex":false,"type":"page","pattern":"^\\/confirm\\/?$","segments":[[{"content":"confirm","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/confirm.astro","pathname":"/confirm","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/disclaimer","isIndex":false,"type":"page","pattern":"^\\/disclaimer\\/?$","segments":[[{"content":"disclaimer","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/disclaimer.astro","pathname":"/disclaimer","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/methodology","isIndex":false,"type":"page","pattern":"^\\/methodology\\/?$","segments":[[{"content":"methodology","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/methodology.astro","pathname":"/methodology","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/privacy","isIndex":false,"type":"page","pattern":"^\\/privacy\\/?$","segments":[[{"content":"privacy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/privacy.astro","pathname":"/privacy","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.CP61kNZB.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"},{"type":"inline","content":"@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}\n"}],"routeData":{"route":"/report","isIndex":false,"type":"page","pattern":"^\\/report\\/?$","segments":[[{"content":"report","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/report.astro","pathname":"/report","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/what-is-tou-pricing","isIndex":false,"type":"page","pattern":"^\\/what-is-tou-pricing\\/?$","segments":[[{"content":"what-is-tou-pricing","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/what-is-tou-pricing.astro","pathname":"/what-is-tou-pricing","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BkoFJ0Lt.js"}],"styles":[{"type":"external","src":"/_astro/about.C3mw7cb2.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://solarmath.com.au","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Jay/Trawl/solarcalc/src/pages/about.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/confirm.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/disclaimer.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/methodology.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/privacy.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/report.astro",{"propagation":"none","containsHead":true}],["C:/Users/Jay/Trawl/solarcalc/src/pages/what-is-tou-pricing.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/confirm@_@ts":"pages/api/confirm.astro.mjs","\u0000@astro-page:src/pages/api/subscribe@_@ts":"pages/api/subscribe.astro.mjs","\u0000@astro-page:src/pages/confirm@_@astro":"pages/confirm.astro.mjs","\u0000@astro-page:src/pages/disclaimer@_@astro":"pages/disclaimer.astro.mjs","\u0000@astro-page:src/pages/methodology@_@astro":"pages/methodology.astro.mjs","\u0000@astro-page:src/pages/privacy@_@astro":"pages/privacy.astro.mjs","\u0000@astro-page:src/pages/report@_@astro":"pages/report.astro.mjs","\u0000@astro-page:src/pages/what-is-tou-pricing@_@astro":"pages/what-is-tou-pricing.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","C:/Users/Jay/Trawl/solarcalc/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_Do_WhlVo.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.CP61kNZB.js","@astrojs/react/client.js":"_astro/client.DWvMSTGb.js","C:/Users/Jay/Trawl/solarcalc/src/components/SolarEVCalculator":"_astro/SolarEVCalculator.DWq557Jf.js","/astro/hoisted.js?q=1":"_astro/hoisted.BkoFJ0Lt.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/about.C3mw7cb2.css","/battery-config.json","/favicon.svg","/images/hero-solar.png","/_astro/client.DWvMSTGb.js","/_astro/hoisted.BkoFJ0Lt.js","/_astro/hoisted.CP61kNZB.js","/_astro/index.DJO9vBfz.js","/_astro/SolarEVCalculator.DWq557Jf.js"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"i/IQYYyd003U29Ux8LTGfPt5iY/cwF2dahuRckOlWu4=","experimentalEnvGetSecretEnabled":false});

export { manifest };
