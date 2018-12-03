//objectStore start
let list = document.querySelectorAll(".series-title:not(.block)");
let newerList = [];
for (let item of list) newerList.push(item.innerText);

let progressList = document.querySelectorAll(".episode-progress");
progressList = Array.from(progressList);
progressList = progressList.filter(item => item.offsetParent != null);
var objectStore = [];
for (let i = 0; i < progressList.length; i++) {
  let complete = progressList[i].style.cssText.replace(/([^0-9]+)/g, "");
  complete > 90
    ? objectStore.push({ watched: true })
    : objectStore.push({ watched: false });
}

newerList.forEach((item, index) => (objectStore[index].title = item));

let currentEpisodeArray = document.querySelectorAll(".landscape-element.left");
//Current Episode URLs
currentEpisodeArray.forEach(
  (item, index) => (objectStore[index].episodeURL = item.href)
); //added to objectStore

let episodeDataContainer = document.querySelectorAll(
  ".series-data.ellipsis:not(.block)"
); //episode number and title text string
let regexp = /(?:Next up: )(?:Episode )(\S+)(?:\ \–\ )?(.+) */;
//regex to break the string down
let noNumberRegexp = /(?:Next up: )(.+) */;
//regex without episode number
episodeDataContainer.forEach((data, index) => {
  let extractedArray = regexp.exec(data.innerText);
  if (extractedArray !== null) {
    objectStore[index].episodeNumber = extractedArray[1];
    objectStore[index].episodeTitle = extractedArray[2];
    //case with episode number
  } else {
    extractedArray = noNumberRegexp.exec(data.innerText);
    objectStore[index].episodeNumber = null;
    objectStore[index].episodeTitle = extractedArray[1];
    //case of no episode number
  }
}); //added to objectStore

//objectStore complete

chrome.storage.local.set({ objectStore }, function() {
  console.log("Set objectStore.");
});
