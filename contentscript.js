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

chrome.storage.sync.set({ objectStore }, function() {
  console.log("Set objectStore.");
});
