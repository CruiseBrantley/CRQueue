let loading = true;
let targetId = null;
let clickFlag = false;
let globalExpanded = () => null; //holds callback to last expanded description
let page = document.getElementById("seriesDiv");
const reloadQueue = document.getElementById("updateButton");
const sort = document.getElementById("sortButton");
const search = document.getElementById("searchInput");
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
              "https://www.crunchyroll.com/login?next=%2Fhome%2Fqueue" ||
            tabs[0].url != "https://www.crunchyroll.com/login"
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
  let objectStore = data.objectStore;

  sort.addEventListener("click", () => sortTitles(objectStore));

  search.addEventListener("input", e => searchTitles(e, objectStore));

  renderTitles(objectStore);
}

function renderTitles(renderStore) {
  let count = 0;
  console.log(renderStore);
  while (page.firstChild) {
    page.removeChild(page.firstChild);
  }
  for (let item of renderStore) {
    const linebreak = document.createElement("br");
    const container = createContainer(count);
    const descriptionContainer = createDescriptionContainer();
    const episodeTitle = createEpisodeTitle(item);
    const episodeDescription = createEpisodeDescription(item);
    const series = createSeries(item);
    const check = createCheck(item);
    const textSubcontainer = createTextSubcontainer();
    const image = createEpisodeImage(item);
    descriptionContainer.addEventListener("click", e => {
      e.stopPropagation();
      clickFlag = true;
      chrome.tabs.update({
        url: item.episodeURL
      });
      descriptionContainer.style.animationDuration = "250ms";
      descriptionContainer.style.marginLeft = "120%";
      setTimeout(() => {
        window.close();
      }, 300);
    }); //URL click handler
    container.addEventListener("click", () => expandFunction());
    function expandFunction() {
      if (globalExpanded() !== descriptionContainer) {
        descriptionContainer.style.height = "100px";
        globalExpanded = () => {
          descriptionContainer.style.height = "0px";
          return descriptionContainer;
        };
      } else globalExpanded = () => null;
    } //expand description logic
    seriesMouseover(container, check);
    seriesMouseleave(container, count, check); //Series expand hover
    descriptionContainerMouseover(descriptionContainer);
    descriptionContainerMouseleave(descriptionContainer); //descriptionContainer buttonlike hover
    appendChildren(
      container,
      series,
      linebreak,
      descriptionContainer,
      episodeTitle,
      episodeDescription,
      check,
      textSubcontainer,
      image
    );
    count++;
  }
}

function isSorted(arr) {
  let len = arr.length - 1;
  for (let i = 0; i < len; ++i) {
    if (arr[i].title.toLowerCase() > arr[i + 1].title.toLowerCase()) {
      return false;
    }
  }
  return true;
}

function sortTitles(data) {
  const baseList = data;
  let sortedList;
  if (isSorted(baseList))
    sortedList = data.sort((a, b) => {
      var titleA = a.title.toLowerCase(); // ignore upper and lowercase
      var titleB = b.title.toLowerCase(); // ignore upper and lowercase
      if (titleA < titleB) {
        return 1;
      }
      if (titleA > titleB) {
        return -1;
      }
      return 0;
    });
  else
    sortedList = data.sort((a, b) => {
      var titleA = a.title.toLowerCase(); // ignore upper and lowercase
      var titleB = b.title.toLowerCase(); // ignore upper and lowercase
      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }
      return 0;
    });
  console.log(sortedList);
  renderTitles(sortedList);
}

function searchTitles(e, objectStore) {
  let filtered = objectStore.filter(p => {
    let lowerTitle = p.title.toLowerCase();
    return lowerTitle.includes(e.target.value.toLowerCase());
  });
  renderTitles(filtered);
}

function descriptionContainerMouseover(descriptionContainer) {
  descriptionContainer.addEventListener("mouseover", () => {
    descriptionContainer.style.marginLeft = "20px";
    descriptionContainer.style.marginRight = "-20px";
    descriptionContainer.style.boxShadow = "-10px 10px 30px rgba(0, 0, 0, 0.5)";
  });
}

function descriptionContainerMouseleave(descriptionContainer) {
  descriptionContainer.addEventListener("mouseleave", () => {
    if (!clickFlag) {
      descriptionContainer.style.marginRight = "0px";
      descriptionContainer.style.marginLeft = "0px";
      descriptionContainer.style.boxShadow = null;
    }
  });
}

function seriesMouseover(container, check) {
  container.addEventListener("mouseover", () => {
    container.style.background = "rgba(255,165,0,.84)";
    container.style.marginLeft = "-10px";
    container.style.boxShadow = "-10px 10px 30px rgba(0, 0, 0, 0.5)";
    container.style.transitionDuration = null;

    check.style.right = "60px";
    check.style.transitionDuration = null;
  });
}

function seriesMouseleave(container, count, check) {
  container.addEventListener("mouseleave", () => {
    container.style.transitionDuration = ".5s";
    container.style.marginLeft = null;
    container.style.boxShadow = null;
    !(count % 2)
      ? (container.style.background = "rgba(255,165,0,.44)")
      : (container.style.background = "rgba(255,165,0,.15)");

    check.style.transitionDuration = ".5s";
    check.style.right = "50px";
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
  check,
  textSubcontainer,
  image
) {
  page.appendChild(container);
  container.appendChild(series);
  container.appendChild(check);
  container.appendChild(linebreak);
  container.appendChild(descriptionContainer);
  descriptionContainer.appendChild(textSubcontainer);
  descriptionContainer.appendChild(image);
  textSubcontainer.appendChild(episodeTitle);
  textSubcontainer.appendChild(episodeDescription);
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
  series.style.fontWeight = "600";
  series.style.transitionDuration = ".3s";
  series.style.maxWidth = "80%";
  return series;
}

function createEpisodeTitle(item) {
  let episodeTitle = document.createElement("span");
  episodeTitle.innerHTML =
    "Ep." +
    (item.episodeNumber ? item.episodeNumber : "SP") +
    " " +
    item.episodeTitle;
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
  episodeDescription.style.fontSize = "1.2rem";
  return episodeDescription;
}

function createDescriptionContainer() {
  let descriptionContainer = document.createElement("div");
  descriptionContainer.style.display = "flex";
  descriptionContainer.style.flexDirection = "row";
  descriptionContainer.style.justifyContent = "space-between";
  descriptionContainer.style.height = "0px";
  descriptionContainer.style.transitionDuration = ".3s";
  descriptionContainer.style.cursor = "pointer";
  descriptionContainer.style.overflow = "hidden";
  descriptionContainer.style.background = "white";
  return descriptionContainer;
}

function createTextSubcontainer() {
  let textSubcontainer = document.createElement("div");
  textSubcontainer.style.display = "flex";
  textSubcontainer.style.flexDirection = "column";
  textSubcontainer.style.alignItems = "center";
  textSubcontainer.style.justifyContent = "start";
  textSubcontainer.style.alignItems = "start";
  return textSubcontainer;
}

function createEpisodeImage(item) {
  let episodeImage = document.createElement("img");
  episodeImage.src = item.episodeImage;
  episodeImage.style.height = "100px";
  return episodeImage;
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
    ? (container.style.background = "rgba(255,165,0,.44)")
    : (container.style.background = "rgba(255,165,0,.15)");
  container.style.transitionDuration = ".3s";
  container.style.userSelect = "none";
  return container;
}
