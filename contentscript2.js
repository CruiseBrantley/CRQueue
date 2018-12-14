chrome.storage.local.set({ objectStore: false, loggedIn: false }, () => {
  console.log("Not Logged In");
});
