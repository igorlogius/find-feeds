/* global browser */

function openFeedInTab(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  browser.tabs.create({
    active: true,
    url: evt.target.href,
  });
}

async function init() {
  // update progress
  await browser.runtime.onMessage.addListener((data, sender) => {
    if (data.nburls2check) {
      document
        .getElementById("urls2checkProgress")
        .setAttribute("max", parseInt(data.nburls2check));
    }
    if (data.urls2checkProgress) {
      document
        .getElementById("urls2checkProgress")
        .setAttribute("value", data.urls2checkProgress);
    }
  });
  const tbl = document.getElementById("feedlist");
  const msg = document.getElementById("msg");

  try {
    //
    let objs = await browser.runtime.sendMessage({});
    //
    if (objs.length < 1) {
      msg.textContent = "No feeds found";
      return;
    }
    msg.textContent = objs.length + " supposed feeds found";

    //
    //let idCounter = 1;
    objs.forEach((obj) => {
      const tr = tbl.insertRow();
      const a1 = document.createElement("a");
      //const abbr = document.createElement("abbr");
      const abbrType = document.createElement("abbr");
      const cpybtn = document.createElement("button");
      cpybtn.textContent = "Copy";

      cpybtn.addEventListener(
        "click",
        async (evt) => {
          await navigator.clipboard.writeText(obj.url);
          evt.target.setAttribute("disabled", "");
          setTimeout(() => {
            evt.target.removeAttribute("disabled");
          }, 700);
        },
        false,
      );

      //abbr.setAttribute("title", obj.url);
      abbrType.setAttribute("title", obj.type);
      abbrType.textContent = obj.type === "json" ? "{;}" : "</>";

      a1.textContent = obj.url;
      //a1.appendChild(abbr);
      a1.title = obj.type;
      a1.href = obj.url;
      a1.addEventListener("click", openFeedInTab, false);

      //var td1 = tr.insertCell();
      //td1.textContent = idCounter;

      //var td3 = tr.insertCell();
      //td3.textContent = obj.type;
      //td3.appendChild(abbrType);

      var td2 = tr.insertCell();
      td2.appendChild(a1);

      //var td4 = tr.insertCell();
      //td4.textContent = "🔍";
      //td4.title = obj.url;
      //td4.href = obj.url;
      //td4.addEventListener("click", openFeedInTab, false);

      //var td5 = tr.insertCell();
      //td5.appendChild(cpybtn);

      //idCounter++;
    });
  } catch (e) {
    console.error(e);
    msg.textContent = "No feeds found";
  }
}

init();
