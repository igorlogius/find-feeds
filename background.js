/* global browser */

const tabId2Feeds = new Map();
let pageActionOn = false;
let regexs2code = [];

const xml_substring_matchers = ["rdf", "rss", "atom", "xml"];
const json_substring_matchers = ["json"];

const resource_cache = new Map();

async function checkResource(url) {
  let ret = false;
  if (typeof url === "string") {
    url = url.trim();
    if (url !== "") {
      try {
        const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
        if (res.ok) {
          // 2xx
          //  The name is case-insensitive.
          //  ref https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
          let ctype = res.headers.get("content-type");
          if (typeof ctype === "string") {
            ctype = ctype.trim();
            if (xml_substring_matchers.some((e) => ctype.includes("/" + e))) {
              return {
                url: url,
                ts: Date.now(),
                type: "xml",
              };
            }
            if (json_substring_matchers.some((e) => ctype.includes("/" + e))) {
              return {
                url: url,
                ts: Date.now(),
                type: "json",
              };
            }
          }
        }
      } catch (e) {
        // noop
      }
    }
  }
  return ret;
}

async function getFromStorage(id, fallback) {
  return await (async () => {
    try {
      const tmp = await browser.storage.local.get(id);
      if (typeof tmp[id] !== "undefined") {
        return tmp[id];
      }
    } catch (e) {
      console.error(e);
    }
    return fallback;
  })();
}

function onWebRequestHeadersReceived(details) {
  const new_headers = [];
  for (let header of details.responseHeaders) {
    const hkey = header.name.toLowerCase();
    let hval = header.value.toLowerCase();

    if (hkey === "content-type") {
      if (/.*\/(red|rss|atom|xml)/.test(hval)) {
        hval = "text/xml";
        new_headers.push({ name: hkey, value: hval });
        continue;
      }
    }
    new_headers.push(header);
  }
  return {
    responseHeaders: new_headers,
  };
}

async function onMessage(data, sender) {
  let tabId;
  if (sender.tab) {
    // data update from tab/content-script
    tabId = sender.tab.id;
    let urls2check = [];
    for (const el of regexs2code) {
      if (RegExp(el.regex).test(sender.url)) {
        try {
          urls2check = urls2check.concat(
            (
              await browser.tabs.executeScript(sender.tab.id, {
                code: el.code,
              })
            )[0],
          );
        } catch (err) {
          console.error(`failed to execute script: ${err}`, el.regex);
        }
      }
    }
    urls2check = [...new Set([...data, ...urls2check])];

    data = [];
    let tmp;
    for (const u of urls2check) {
      if (resource_cache.has(u)) {
        tmp = resource_cache.get(u);
        if (tmp !== false) {
          data.push(tmp);
        }
      } else {
        tmp = await checkResource(u);
        resource_cache.set(u, tmp);
        if (tmp !== false) {
          data.push(tmp);
        }
      }
    }
    data.sort((a, b) => {
      return a.url.localeCompare(b.url);
    });
    tabId2Feeds.set(tabId, data);
    if (data.length > 0) {
      browser.browserAction.enable(tabId);
      if (pageActionOn) {
        browser.pageAction.show(tabId);
      }
      browser.browserAction.setBadgeText({ text: "" + data.length, tabId });
    } else {
      browser.browserAction.disable(tabId);
      if (pageActionOn) {
        browser.pageAction.hide(tabId);
      }
      browser.browserAction.setBadgeText({ text: "", tabId });
    }
  } else {
    // popup
    tabId = (
      await browser.tabs.query({ currentWindow: true, active: true })
    ).map((t) => t.id)[0];
    if (tabId2Feeds.has(tabId)) {
      data = tabId2Feeds.get(tabId);
      return data;
    }
  }
}

function onTabRemoved(tabId) {
  if (tabId2Feeds.has(tabId)) {
    tabId2Feeds.delete(tabId);
  }
}

browser.menus.create({
  title: "Preferences",
  contexts: ["browser_action"],
  onclick: function () {
    browser.runtime.openOptionsPage();
  },
});

// default state for browserAction icon is off
browser.browserAction.disable();

// register listeners
browser.webRequest.onHeadersReceived.addListener(
  onWebRequestHeadersReceived,
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking", "responseHeaders"],
);

async function handleInstalled(details) {
  if (details.reason === "install") {
    const resp = await fetch(
      browser.runtime.getURL("custom-feed-detectors.json"),
    );
    const json = await resp.json();
    browser.storage.local.set({ selectors: json });
  }
}

function onTabUpdated(tabId /*, changeInfo, tabInfo*/) {
  tabId2Feeds.set(tabId, []);
  browser.browserAction.disable(tabId);
  browser.browserAction.setBadgeText({ tabId, text: "" });
}

async function onStorageChanged() {
  pageActionOn = await getFromStorage("pageActionOn", false);
  const selectors = await getFromStorage("selectors", []);
  regexs2code = [];
  for (let selector of selectors) {
    if (selector.activ) {
      regexs2code.push({ regex: selector.url_regex, code: selector.code });
    }
  }
}

(async () => {
  onStorageChanged();

  browser.runtime.onInstalled.addListener(handleInstalled);
  browser.runtime.onMessage.addListener(onMessage);
  browser.storage.onChanged.addListener(onStorageChanged);
  browser.tabs.onRemoved.addListener(onTabRemoved);
  browser.tabs.onUpdated.addListener(onTabUpdated, { properties: ["url"] });

  setInterval(
    () => {
      const now = Date.now();
      resource_cache.forEach((item, key, map) => {
        if (now - item.ts > 1000 * 60 * 60) {
          //console.debug('deleted', key , ' from cache');
          map.delete(key);
        }
      });
    },
    1000 * 60 * 10,
  );
})();
