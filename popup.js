// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", data => {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute("value", data.color);
// });

let objectStore = [];
let page = document.getElementById("seriesDiv");

chrome.storage.sync.get("objectStore", data => {
  objectStore = data.objectStore;
  // console.log(objectStore);
  for (let item of objectStore) {
    let series = document.createElement("span");
    // series.style.backgroundColor = item;
    series.innerHTML = item.title;
    console.log(item.title);
    series.addEventListener("click", function() {
      // chrome.storage.sync.set({ color: item }, function() {
      //   console.log("color is " + item);
      // });
    });
    page.appendChild(series);
  }
});

// changeColor.onclick = element => {
//   console.log(objectStore);
//   let color = element.target.value;
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     chrome.tabs.executeScript(tabs[0].id, {
//       code: 'document.body.style.backgroundColor = "' + color + '";'
//     });
//   });
// };
