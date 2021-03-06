let list = document.querySelectorAll(".queue-item-wrapper");
let regexp = /(.+\n)(?:.+:)(?: Episode (.+) – )?(.+)?(?:\n+)?(.+)?/;
let objectStore = [];

for (let i = 0; i < list.length; i++) {
  const currentObject = {};
  const infoArray = regexp.exec(list[i].children[0].children[2].innerText);
  currentObject.title = infoArray[1];
  currentObject.episodeNumber = infoArray[2];
  currentObject.episodeTitle = infoArray[3];
  infoArray[4]
    ? (currentObject.episodeDescription = infoArray[4])
    : (currentObject.episodeDescription = "No episode description available.");
  currentObject.episodeURL = list[i].children[0].children[2].href;
  currentObject.episodeImage = list[i].children[0].children[2].children[0].children[0].children[0].src;
  const episodeProgress =
    list[i].children[0].children[2].children[0].children[1].children[0].style.width;
  episodeProgress.slice(0, -1) > 90
    ? (currentObject.watched = true)
    : (currentObject.watched = false);

  objectStore.push(currentObject);
}

chrome.storage.local.set({ objectStore, loggedIn: true }, () => {
  console.log("User is logged in, set objectStore");
});
