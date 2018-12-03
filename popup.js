let objectStore = [];
let page = document.getElementById("seriesDiv");

chrome.storage.local.get("objectStore", data => {
  if (data.objectStore) {
    objectStore = data.objectStore;
    console.log(objectStore);
    let count = 0;
    for (let item of objectStore) {
      let linebreak = document.createElement("br");
      let container = document.createElement("div");
      container.style.width = "100%";
      !(count % 2)
        ? (container.style.background = "rgba(252,181,2,.44)")
        : null;
      container.style.marginBottom = "2px";
      container.style.userSelect = "none";
      container.style.transitionDuration = ".25s";

      let episodeNumber = document.createElement("span");
      episodeNumber.innerHTML =
        "Episode: " + (item.episodeNumber ? item.episodeNumber : "Special");
      episodeNumber.style.marginBottom = "5px";
      episodeNumber.style.padding = "5px";
      episodeNumber.style.display = "inline-block";
      episodeNumber.style.fontSize = "1rem";

      let descriptionContainer = document.createElement("div");
      descriptionContainer.style.display = "flex";
      descriptionContainer.style.alignItems = "center";
      descriptionContainer.style.height = "0px";
      descriptionContainer.style.transitionDuration = ".25s";
      descriptionContainer.style.overflow = "hidden";

      let episodeDescription = document.createElement("span");
      episodeDescription.innerHTML = item.episodeDescription;
      episodeDescription.style.marginBottom = "5px";
      episodeDescription.style.padding = "5px";
      episodeDescription.style.fontSize = "1rem";

      let series = document.createElement("span");
      item.watched ? (series.style.textDecoration = "line-through") : null;
      series.innerHTML = item.title;
      series.style.marginBottom = "5px";
      series.style.padding = "5px";
      series.style.display = "inline-block";
      series.style.fontSize = "1.2rem";
      series.style.cursor = "pointer";
      series.style.transitionDuration = ".25s";
      series.style.border = "1px solid transparent";
      series.style.maxWidth = "300px";

      series.addEventListener("click", e => {
        e.stopPropagation();
        chrome.tabs.update({
          url: item.episodeURL
        });
      });

      let expanded = false;
      container.addEventListener("click", () => {
        expanded = !expanded;
        if (expanded) {
          descriptionContainer.style.height = "100px";
        } else {
          descriptionContainer.style.height = "0";
        }
      }); //Expand description logic

      container.addEventListener("mouseover", () => {
        series.style.boxShadow = "-7px 7px orange";
        series.style.border = "1px solid black";
        series.style.marginLeft = "7px";
        series.style.textDecoration = null;
        series.style.background = "white";
      });
      container.addEventListener("mouseleave", () => {
        if (!expanded) {
          series.style.boxShadow = null;
          series.style.border = "1px solid transparent";
          series.style.marginLeft = null;
          item.watched ? (series.style.textDecoration = "line-through") : null;
          series.style.background = null;
        }
      });

      page.appendChild(container);
      container.appendChild(series);
      container.appendChild(linebreak);
      container.appendChild(descriptionContainer);
      descriptionContainer.appendChild(episodeNumber);
      descriptionContainer.appendChild(episodeDescription);
      count++;
    }
  }
});
