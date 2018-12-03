let objectStore = [];
let loading = true;
let targetId = null;
let page = document.getElementById("seriesDiv");

chrome.storage.local.get("objectStore", data => {
  if (data.objectStore) {
    createQueue(data);
  } else {
    chrome.tabs.create(
      {
        url: "https://www.crunchyroll.com/home/queue",
        index: 0,
        active: false
      },
      tab => {
        targetId = tab.id;
        // setTimeout(() => {
        //   chrome.tabs.remove(tab.id);
        // }, 10000);
      }
    );
    const dataCheck = setInterval(() => {
      chrome.storage.local.get("objectStore", data => {
        if (data.objectStore) {
          loading = false;
          clearInterval(dataCheck);
          createQueue(data);
        }
      });
    }, 100);
  }
});
function createQueue(data) {
  loading = false;
  objectStore = data.objectStore;
  console.log(objectStore);
  let count = 0;
  for (let item of objectStore) {
    let linebreak = document.createElement("br");
    let container = createContainer(count);
    let episodeNumber = createEpisodeNumber(item);
    let descriptionContainer = createDescriptionContainer();
    let episodeTitle = createEpisodeTitle(item);
    let episodeDescription = createEpisodeDescription(item);
    let series = createSeries(item);
    series.addEventListener("click", e => {
      e.stopPropagation();
      chrome.tabs.update({
        url: item.episodeURL
      });
    }); //URL click handler
    let expanded = false;
    container.addEventListener("click", () => {
      expanded = !expanded;
      if (expanded) {
        descriptionContainer.style.height = "100px";
        console.log(descriptionContainer, descriptionContainer.scrollHeight);
        // while (
        //   descriptionContainer.offsetHeight <
        //   descriptionContainer.scrollHeight
        // ) {
        //   descriptionContainer.style.height =
        //     descriptionContainer.offsetHeight + 20 + "px";
        // }
      } else {
        descriptionContainer.style.height = "0px";
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
    appendChildren(
      container,
      series,
      linebreak,
      descriptionContainer,
      episodeNumber,
      episodeTitle,
      episodeDescription
    );
    count++;
  }
}

function appendChildren(
  container,
  series,
  linebreak,
  descriptionContainer,
  episodeNumber,
  episodeTitle,
  episodeDescription
) {
  page.appendChild(container);
  container.appendChild(series);
  container.appendChild(linebreak);
  container.appendChild(descriptionContainer);
  descriptionContainer.appendChild(episodeNumber);
  descriptionContainer.appendChild(episodeTitle);
  descriptionContainer.appendChild(episodeDescription);
}

function createSeries(item) {
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
  series.style.maxWidth = "80%";
  return series;
}

function createEpisodeTitle(item) {
  let episodeTitle = document.createElement("span");
  episodeTitle.innerHTML = item.episodeTitle;
  episodeTitle.style.marginBottom = "5px";
  episodeTitle.style.padding = "5px";
  episodeTitle.style.fontSize = "1rem";
  return episodeTitle;
}

function createEpisodeDescription(item) {
  let episodeDescription = document.createElement("span");
  episodeDescription.innerHTML = item.episodeDescription;
  episodeDescription.style.marginBottom = "5px";
  episodeDescription.style.padding = "5px";
  episodeDescription.style.fontSize = "1rem";
  return episodeDescription;
}

function createDescriptionContainer() {
  let descriptionContainer = document.createElement("div");
  descriptionContainer.style.display = "flex";
  descriptionContainer.style.alignItems = "center";
  descriptionContainer.style.height = "0px";
  descriptionContainer.style.transitionDuration = ".15s";
  descriptionContainer.style.overflow = "hidden";
  descriptionContainer.style.background = "white";
  descriptionContainer.style.justifyContent = "space-between";
  return descriptionContainer;
}

function createEpisodeNumber(item) {
  let episodeNumber = document.createElement("span");
  episodeNumber.innerHTML =
    "Episode: " + (item.episodeNumber ? item.episodeNumber : "Special");
  episodeNumber.style.marginBottom = "5px";
  episodeNumber.style.padding = "5px";
  episodeNumber.style.display = "inline-block";
  episodeNumber.style.fontSize = "1rem";
  return episodeNumber;
}

function createContainer(count) {
  let container = document.createElement("div");
  container.style.width = "100%";
  !(count % 2) ? (container.style.background = "rgba(252,181,2,.44)") : null;
  container.style.marginBottom = "2px";
  container.style.userSelect = "none";
  container.style.transitionDuration = ".25s";
  return container;
}
