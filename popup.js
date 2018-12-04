let objectStore = [];
let loading = true;
let targetId = null;
let page = document.getElementById("seriesDiv");
let reloadQueue = document.getElementById("updateButton");

chrome.storage.local.get("objectStore", data =>
  data.objectStore ? createQueue(data) : loadData()
);

function loadData() {
  let loadingElement = document.createElement("span");
  loadingElement.style.fontSize = "1.2rem";
  loadingElement.innerHTML = "\n\nLoading...";
  page.appendChild(loadingElement);

  chrome.tabs.create(
    {
      url: "https://www.crunchyroll.com/home/queue",
      index: 0,
      active: false
    },
    tab => (targetId = tab.id)
  );
  const dataCheck = setInterval(() => {
    chrome.storage.local.get("objectStore", data => {
      if (data.objectStore) {
        loading = false;
        chrome.tabs.remove(targetId);
        page.removeChild(loadingElement);
        createQueue(data);
        clearInterval(dataCheck);
      }
    });
  }, 100);
}

function createQueue(data) {
  loading = false;
  objectStore = data.objectStore;
  console.log(objectStore);
  let count = 0;
  for (let item of objectStore) {
    const linebreak = document.createElement("br");
    const container = createContainer(count);
    const episodeNumber = createEpisodeNumber(item);
    const descriptionContainer = createDescriptionContainer();
    const episodeTitle = createEpisodeTitle(item);
    const episodeDescription = createEpisodeDescription(item);
    const series = createSeries(item);
    const check = createCheck(item);
    let expanded = false;

    descriptionContainer.addEventListener("click", e => {
      e.stopPropagation();
      chrome.tabs.update({
        url: item.episodeURL
      });
      expandFunction();
      descriptionContainer.style.marginLeft = "100%";
      setTimeout(() => {
        descriptionContainer.style.marginLeft = "0px";
        window.close();
      }, 500);
    }); //URL click handler
    container.addEventListener("click", () => expandFunction());

    function expandFunction() {
      expanded = !expanded;
      if (expanded) {
        descriptionContainer.style.height = "100px";
        descriptionContainer.style.border = "1px solid transparent";
      } else {
        descriptionContainer.style.height = "0px";
        descriptionContainer.style.border = null;
      }
    } //expand description logic

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
        series.style.background = null;
      }
    }); //Title popout hover

    descriptionContainer.addEventListener("mouseover", () => {
      descriptionContainer.style.border = "1px solid lightgrey";
      descriptionContainer.style.borderTopLeftRadius = "30px";
      descriptionContainer.style.borderBottomLeftRadius = "30px";
      descriptionContainer.style.paddingLeft = "10px";
      descriptionContainer.style.marginRight = "-10px";
    });
    descriptionContainer.addEventListener("mouseleave", () => {
      descriptionContainer.style.border = "1px solid transparent";
      descriptionContainer.style.borderTopLeftRadius = "0px";
      descriptionContainer.style.borderBottomLeftRadius = "0px";
      descriptionContainer.style.paddingLeft = "0px";
      descriptionContainer.style.marginRight = "0px";
    }); //descriptionContainer buttonlike hover

    reloadQueue.addEventListener("click", () => {
      chrome.storage.local.set({ objectStore: null });
      window.location.reload();
    });

    appendChildren(
      container,
      series,
      linebreak,
      descriptionContainer,
      episodeNumber,
      episodeTitle,
      episodeDescription,
      check
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
  episodeDescription,
  check
) {
  page.appendChild(container);
  container.appendChild(series);
  container.appendChild(check);
  container.appendChild(linebreak);
  container.appendChild(descriptionContainer);
  descriptionContainer.appendChild(episodeNumber);
  descriptionContainer.appendChild(episodeTitle);
  descriptionContainer.appendChild(episodeDescription);
}

function createSeries(item) {
  let series = document.createElement("span");
  series.innerHTML = item.title;
  series.style.marginBottom = "5px";
  series.style.padding = "5px";
  series.style.display = "inline-block";
  series.style.fontSize = "1.2rem";
  series.style.transitionDuration = ".20s";
  series.style.border = "1px solid transparent";
  series.style.maxWidth = "80%";
  return series;
}

function createEpisodeTitle(item) {
  let episodeTitle = document.createElement("span");
  episodeTitle.innerHTML = item.episodeTitle;
  episodeTitle.style.marginBottom = "5px";
  episodeTitle.style.padding = "5px";
  episodeTitle.style.fontSize = "1.2rem";
  episodeTitle.style.fontWeight = "600";
  return episodeTitle;
}

function createCheck(item) {
  let check = document.createElement("span");
  check.innerHTML = item.watched ? " &#10003;" : "";
  check.style.marginBottom = "5px";
  check.style.padding = "5px";
  check.style.fontSize = "1.2rem";
  check.style.position = "absolute";
  check.style.right = "50px";
  return check;
}

function createEpisodeDescription(item) {
  let episodeDescription = document.createElement("span");
  episodeDescription.innerHTML = item.episodeDescription;
  episodeDescription.style.marginBottom = "5px";
  episodeDescription.style.padding = "5px";
  episodeDescription.style.fontSize = "1.2rem";
  return episodeDescription;
}

function createDescriptionContainer() {
  let descriptionContainer = document.createElement("div");
  descriptionContainer.style.display = "flex";
  descriptionContainer.style.alignItems = "center";
  descriptionContainer.style.height = "0px";
  descriptionContainer.style.transitionDuration = ".3s";
  descriptionContainer.style.cursor = "pointer";
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
  episodeNumber.style.fontSize = "1.2rem";
  episodeNumber.style.fontWeight = "600";
  return episodeNumber;
}

function createContainer(count) {
  let container = document.createElement("div");
  container.style.width = "100%";
  !(count % 2)
    ? (container.style.background = "rgba(252,181,2,.44)")
    : (container.style.background = "oldlace");
  container.style.marginBottom = "2px";
  container.style.userSelect = "none";
  return container;
}
