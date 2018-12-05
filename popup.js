let loading = true;
let targetId = null;
let globalExpanded = () => null; //holds callback to last expanded description
const page = document.getElementById("seriesDiv");
const reloadQueue = document.getElementById("updateButton");
reloadQueueClick();

const loadingElement = document.createElement("span");
loadingElement.style.fontSize = "1.2rem";
loadingElement.innerHTML = "\n\nLoading...";

chrome.storage.local.get(["objectStore", "loggedIn"], data =>
  data.objectStore && data.objectStore !== undefined && data.loggedIn
    ? createQueue(data)
    : loadData()
);

function loadData() {
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
    chrome.storage.local.get(["objectStore", "loggedIn"], data => {
      if (data.objectStore) {
        loading = false;
        chrome.tabs.remove(targetId);
        page.removeChild(loadingElement);
        createQueue(data);
        clearInterval(dataCheck);
      }
      if (
        data.loggedIn === false &&
        (data.objectStore === false || data.objectStore === [])
      ) {
        chrome.storage.local.set({ objectStore: null, loggedIn: null });
        page.removeChild(loadingElement);
        let loggedOutElement = document.createElement("span");
        loggedOutElement.style.fontSize = "1.2rem";
        loggedOutElement.innerHTML =
          "\n\nPlease log in to Cunchyroll then try again";
        page.appendChild(loggedOutElement);
        clearInterval(dataCheck);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (
            tabs[0].url !=
            "https://www.crunchyroll.com/login?next=%2Fhome%2Fqueue"
          ) {
            setTimeout(
              () => chrome.tabs.update(targetId, { highlighted: true }),
              2000
            );
          } else chrome.tabs.remove(targetId);
        });
      }
    });
  }, 100);
}

function createQueue(data) {
  loading = false;
  objectStore = data.objectStore;
  let count = 0;
  for (let item of objectStore) {
    const linebreak = document.createElement("br");
    const container = createContainer(count);
    // const episodeNumber = createEpisodeNumber(item);
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
      if (globalExpanded() !== descriptionContainer) {
        item.episodeDescription.length > 50
          ? (descriptionContainer.style.height = "130px")
          : (descriptionContainer.style.height = "80px");
        descriptionContainer.style.border = "1px solid transparent";
        globalExpanded = () => {
          descriptionContainer.style.height = "0px";
          descriptionContainer.style.border = null;
          return descriptionContainer;
        };
      } else globalExpanded = () => null;
    } //expand description logic

    seriesMouseover(container, series);
    seriesMouseleave(container, expanded, series); //Series expand hover

    descriptionContainerMouseover(descriptionContainer);
    descriptionContainerMouseleave(descriptionContainer, expanded); //descriptionContainer buttonlike hover

    appendChildren(
      container,
      series,
      linebreak,
      descriptionContainer,
      episodeTitle,
      episodeDescription,
      check
    );
    count++;
  }
}

function descriptionContainerMouseleave(descriptionContainer, expanded) {
  descriptionContainer.addEventListener("mouseleave", () => {
    expanded === true
      ? (descriptionContainer.style.border = "1px solid transparent")
      : (descriptionContainer.style.border = null);
    descriptionContainer.style.borderTopLeftRadius = "0px";
    descriptionContainer.style.borderBottomLeftRadius = "0px";
    descriptionContainer.style.paddingLeft = "0px";
    descriptionContainer.style.marginRight = "0px";
    descriptionContainer.style.boxShadow = null;
  });
}

function descriptionContainerMouseover(descriptionContainer) {
  descriptionContainer.addEventListener("mouseover", () => {
    descriptionContainer.style.border = "1px solid lightgrey";
    descriptionContainer.style.borderTopLeftRadius = "30px";
    descriptionContainer.style.borderBottomLeftRadius = "30px";
    descriptionContainer.style.paddingLeft = "10px";
    descriptionContainer.style.marginRight = "-10px";
    descriptionContainer.style.boxShadow = "-10px 10px 30px lightgrey";
  });
}

function seriesMouseleave(container, expanded, series) {
  container.addEventListener("mouseleave", () => {
    if (!expanded) {
      // series.style.boxShadow = null;
      // series.style.border = "1px solid transparent";
      // series.style.marginLeft = null;
      // series.style.background = null;
      setTimeout(() => (series.style.fontSize = "1.2rem"), 100);
    }
  });
}

function seriesMouseover(container, series) {
  container.addEventListener("mouseover", () => {
    // series.style.boxShadow = "-7px 7px orange";
    // series.style.border = "1px solid black";
    // series.style.marginLeft = "7px";
    // series.style.background = "white";
    series.style.fontSize = "1.5rem";
  });
}

function reloadQueueClick() {
  reloadQueue.addEventListener("click", () => {
    chrome.storage.local.set({ objectStore: null, loggedIn: null });
    window.location.reload();
  });
}

function appendChildren(
  container,
  series,
  linebreak,
  descriptionContainer,
  episodeTitle,
  episodeDescription,
  check
) {
  page.appendChild(container);
  container.appendChild(series);
  container.appendChild(check);
  container.appendChild(linebreak);
  container.appendChild(descriptionContainer);
  descriptionContainer.appendChild(episodeTitle);
  descriptionContainer.appendChild(episodeDescription);
}

function createSeries(item) {
  let series = document.createElement("span");
  item.title.length > 42
    ? (series.innerHTML = item.title.substring(0, 42) + "...")
    : (series.innerHTML = item.title);
  series.style.marginBottom = "5px";
  series.style.padding = "5px";
  series.style.display = "inline-block";
  series.style.fontSize = "1.2rem";
  series.style.transitionDuration = ".3s";
  series.style.maxWidth = "80%";
  return series;
}

function createEpisodeTitle(item) {
  let episodeTitle = document.createElement("span");
  episodeTitle.innerHTML =
    item.episodeTitle.length > 50
      ? "Ep." +
        item.episodeNumber +
        " " +
        item.episodeTitle.substring(0, 50) +
        "..."
      : "Ep." + item.episodeNumber + " " + item.episodeTitle;
  episodeTitle.style.marginBottom = "5px";
  episodeTitle.style.marginLeft = "20px";
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
  check.style.color = "green";
  check.style.textShadow = "0px 0px 1px darkgreen";
  return check;
}

function createEpisodeDescription(item) {
  let episodeDescription = document.createElement("span");
  item.episodeDescription === ""
    ? (episodeDescription.innerHTML = "No Episode Description.")
    : (episodeDescription.innerHTML = item.episodeDescription);
  episodeDescription.style.marginBottom = "5px";
  episodeDescription.style.padding = "5px";
  episodeDescription.style.marginLeft = "20px";
  episodeDescription.style.fontSize = "1.2rem";
  return episodeDescription;
}

function createDescriptionContainer() {
  let descriptionContainer = document.createElement("div");
  descriptionContainer.style.display = "flex";
  descriptionContainer.style.flexDirection = "column";
  descriptionContainer.style.alignItems = "center";
  descriptionContainer.style.height = "0px";
  descriptionContainer.style.transitionDuration = ".3s";
  descriptionContainer.style.cursor = "pointer";
  descriptionContainer.style.overflow = "hidden";
  descriptionContainer.style.background = "white";
  descriptionContainer.style.justifyContent = "start";
  descriptionContainer.style.alignItems = "start";
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
  // container.style.marginBottom = "2px";
  container.style.userSelect = "none";
  return container;
}
