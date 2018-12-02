let objectStore = [];
let page = document.getElementById("seriesDiv");

chrome.storage.sync.get("objectStore", data => {
  objectStore = data.objectStore;
  for (let item of objectStore) {
    let series;
    item.watched
      ? (series = document.createElement("strike"))
      : (series = document.createElement("span"));

    // var newCheckBox = document.createElement("input");
    // newCheckBox.type = "checkbox";
    // newCheckBox.checked = item.watched;

    linebreak = document.createElement("br");

    item.watched
      ? (series.style.color = "red")
      : (series.style.color = "black");
    series.innerHTML = item.title;
    page.appendChild(series);
    // page.appendChild(newCheckBox);
    page.appendChild(linebreak);

    // series.addEventListener("click", function() {
    //   chrome.storage.sync.set({ color: item }, function() {
    //     console.log("color is " + item);
    //   });
    // });
  }
});
