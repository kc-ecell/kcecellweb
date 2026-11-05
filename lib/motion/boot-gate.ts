// Runs synchronously in <head>, before first paint, so the boot screen is up
// before the page shows. It has to be a string: nothing bundled has loaded yet.
// It stays on window as __ecellBoot so BootController can replay the screen on
// client-side navigation to the home page. See docs/ANIMATIONS.md §1.
//
// Tier logic is a trimmed copy of detectTier() in MotionProvider.tsx, without
// the WebGL probe (creating a context here would block paint). Unlike the
// provider, reduced motion beats a stored override: Rule 8 has no exceptions.
export const BOOT_GATE_SCRIPT = `(function(){var play=function(){try{
var n=navigator,w=window,s=sessionStorage;
if(location.pathname!=="/")return;
if(n.webdriver||/bot|crawl|spider|slurp|facebookexternalhit/i.test(n.userAgent))return;
if(w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var valid=function(t){return t==="full"||t==="lite"||t==="off"};
var q=new URLSearchParams(location.search).get("motion");
var o=valid(q)?q:s.getItem("ecell:motion:override");
var c=n.connection;
var lite=n.deviceMemory<4||n.hardwareConcurrency<4||(c&&c.saveData)||(w.matchMedia("(pointer: coarse)").matches&&w.innerWidth<768);
var t=valid(o)?o:lite?"lite":"full";
if(t!=="off")document.documentElement.dataset.boot=t;
}catch(e){}};window.__ecellBoot=play;play()})()`;
