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
  const tbl = document.getElementById("feedlist");
  const msg = document.getElementById("msg");

  try {
    //
    let objs = await browser.runtime.sendMessage({});
    //
    msg.textContent = objs.length + " potential feeds found";
    if (objs.length < 1) {
      return;
    }
    if (objs.length === 1) {
      msg.textContent = "1 potential feed found";
    }

    //
    let idCounter = 1;
    objs.forEach((obj) => {
      const tr = tbl.insertRow();
      const a1 = document.createElement("a");
      const abbr = document.createElement("abbr");
      const abbrType = document.createElement("abbr");
      const cpybtn = document.createElement("button");
        cpybtn.textContent = 'Copy';

      cpybtn.addEventListener(
        "click",
        async (evt) => {
          await navigator.clipboard.writeText(obj.url);
          evt.target.setAttribute('disabled', '');
          setTimeout( () => {
            evt.target.removeAttribute('disabled');
        }, 700);
        },
        false,
      );

      abbr.setAttribute("title", obj.url);
      abbrType.setAttribute("title", obj.type);
      abbrType.textContent = obj.type === "json" ? "{;}" : "</>";

      a1.textContent = obj.url;
      a1.appendChild(abbr);
      a1.href = obj.url;
      a1.addEventListener("click", openFeedInTab, false);

      var td1 = tr.insertCell();
      td1.textContent = idCounter;

      var td2 = tr.insertCell();
      td2.appendChild(a1);

      var td3 = tr.insertCell();
      td3.appendChild(abbrType);

      var td4 = tr.insertCell();
      td4.textContent = "🔍";
      td4.title = obj.url;
      td4.href = obj.url;
      td4.addEventListener("click", openFeedInTab, false);

      var td5 = tr.insertCell();
      td5.appendChild(cpybtn);

      idCounter++;
    });
  } catch (e) {
    console.error(e);
    msg.textContent = "No potential feeds found";
  }
}

init();
