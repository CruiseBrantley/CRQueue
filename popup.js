let objectStore = [];
let page = document.getElementById("seriesDiv");

chrome.storage.local.get("objectStore", data => {
  if (data.objectStore) {
    objectStore = data.objectStore;
    let count = 0;
    for (let item of objectStore) {
      let container = document.createElement("div");
      container.style.width = "100%";
      !(count % 2)
        ? (container.style.background = "rgba(252,181,2,.44)")
        : null;
      container.style.marginBottom = "2px";
      let series = document.createElement("span");

      linebreak = document.createElement("br");

      item.watched ? (series.style.textDecoration = "line-through") : null;
      series.innerHTML = item.title;
      series.style.marginBottom = "5px";
      series.style.padding = "5px";
      series.style.display = "inline-block";
      series.style.cursor = "pointer";
      series.style.transitionDuration = ".25s";
      series.style.fontSize = "1rem";
      series.style.border = "1px solid transparent";

      series.addEventListener("click", () => {
        chrome.tabs.update({
          url: item.episodeURL
        });
      });
      container.addEventListener("mouseover", () => {
        series.style.boxShadow = "-7px 7px orange";
        series.style.border = "1px solid black";
        series.style.marginLeft = "7px";
        series.style.textDecoration = null;
        series.style.background = "white";
      });
      container.addEventListener("mouseleave", () => {
        series.style.boxShadow = null;
        series.style.border = "1px solid transparent";
        series.style.marginLeft = null;
        item.watched ? (series.style.textDecoration = "line-through") : null;
        series.style.background = null;
      });

      page.appendChild(container);
      container.appendChild(series);
      container.appendChild(linebreak);
      count++;
    }
  }
});
