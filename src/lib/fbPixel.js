const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

function isConfigured() {
  return Boolean(PIXEL_ID) && PIXEL_ID !== "YOUR_PIXEL_ID";
}

export function initFacebookPixel() {
  if (!isConfigured() || window.fbq) return;

  const fbq = function (...args) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
  };
  window.fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

export function trackEvent(eventName, params) {
  if (!isConfigured() || !window.fbq) return;
  window.fbq("track", eventName, params);
}
