chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  function getStorage(tabId, type) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: getLocalStorageKeys,
        args: [type],
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          sendResponse(results[0].result);
        } else {
          sendResponse([]);
        }
      }
    );
    return true; // Keeps the sendResponse callback valid
  }

  function decompressData(tabId, key, type) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["js/lz-string.min.js"],
      },
      () => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: decompressStorageValue,
            args: [key, type],
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              sendResponse(results[0].result);
            } else {
              sendResponse(null);
            }
          }
        );
      }
    );
    return true; // Keeps the sendResponse callback valid
  }

  if (message.action) {
    var tabId = message.tabId;
    if (message.action == "getStorageKeys") {
      return getStorage(tabId, message.storageType);
    } else if (message.action == "decompressData") {
      return decompressData(tabId, message.key, message.storageType);
    }
  }
});

function getLocalStorageKeys(type) {
  const storageEngine = type === "session" ? sessionStorage : localStorage;
  const keys = [];
  for (let i = 0; i < storageEngine.length; i++) {
    keys.push(storageEngine.key(i));
  }
  return keys;
}

function decompressStorageValue(key, type) {
  const storageEngine = type === "session" ? sessionStorage : localStorage;
  const data = storageEngine.getItem(key);

  if (data) {
    try {
      const decompressedData = LZString.decompress(data);
      if (decompressedData) {
        return { decompressed: JSON.parse(decompressedData), raw: null };
      } else {
        return { decompressed: null, raw: data };
      }
    } catch (error) {
      console.error("Decompression or parsing failed", error);
      return { decompressed: null, raw: data };
    }
  }
  return null;
}
