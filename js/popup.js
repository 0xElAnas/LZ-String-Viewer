let editor; // Declare editor in a higher scope
let storageType = "local"; // Default storage type

// Debounce function to prevent multiple rapid calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Add this function to calculate human-readable file sizes
function humanFileSize(size) {
  if (size > 0) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      ["B", "KB", "MB", "GB", "TB"][i]
    );
  } else {
    return "0 Bytes";
  }
}

function populateDropdown(keys) {
  const keySelect = document.getElementById("keySelect");
  keySelect.innerHTML =
    '<option value="" disabled selected>Select a storage key</option>'; // Clear existing options

  if (keys && keys.length > 0) {
    keys.forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      keySelect.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No keys found";
    keySelect.appendChild(option);
  }
}

function loadKeys() {
  const tabId = chrome.devtools.inspectedWindow.tabId;
  chrome.runtime.sendMessage(
    { action: "getStorageKeys", storageType, tabId },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      populateDropdown(response);
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadKeys();

  document.getElementById("storageType").addEventListener(
    "change",
    debounce(function () {
      storageType = this.value;
      loadKeys();
    }, 300)
  );

  document.getElementById("processBtn").addEventListener("click", () => {
    const keySelect = document.getElementById("keySelect");
    const key = keySelect.value;
    if (!key) {
      alert("Please select a storage key.");
      return;
    }

    const tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.runtime.sendMessage(
      { action: "decompressData", key, storageType, tabId },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (response) {
          displayResults(response);
        } else {
          displayErrorMessage("No data found or decompression failed.");
        }
      }
    );
  });
});

function displayResults(response) {
  const fileSizeElement = document.getElementById("fileSize");
  const originalSizeElement = document.getElementById("originalSize");
  const compressedSizeElement = document.getElementById("compressedSize");
  let dataSize;
  let compressedSize;

  if (response.raw) {
    dataSize = response.raw.length;
    compressedSize = LZString.compress(response.raw).length;
  } else {
    const decompressedData = JSON.stringify(response.decompressed);
    dataSize = decompressedData.length;
    compressedSize = LZString.compress(decompressedData).length;
  }

  originalSizeElement.textContent = `${humanFileSize(dataSize)}`;
  compressedSizeElement.textContent = `${humanFileSize(compressedSize)}`;

  if (response.decompressed) {
    fileSizeElement.style.display = "block";
    displayInJsonEditor(response.decompressed);
  } else if (response.raw) {
    const resultField = document.getElementById("result");
    resultField.textContent = response.raw;
    resultField.style.display = "block";

    const container = document.getElementById("jsoneditor");
    container.innerHTML = ""; // Clear the JSONEditor
    container.style.display = "none";
    fileSizeElement.style.display = "none";
  }
}

function displayInJsonEditor(data) {
  const container = document.getElementById("jsoneditor");
  container.style.display = "block";

  // Remove existing editor if it exists
  if (editor) {
    editor.destroy();
  }

  const options = {
    mode: "view", // Enable view mode as default
    modes: ["view", "form", "tree", "code", "text"], // Allow switching modes
    onError: function (err) {
      console.error(err.toString());
    },
  };

  // Create a new editor instance
  editor = new JSONEditor(container, options);
  editor.set(data);
  document.getElementById("result").style.display = "none";
}

function displayErrorMessage(message) {
  // Remove existing editor if it exists
  if (editor) {
    editor.destroy();
  }
  document.getElementById("result").textContent = message;
  document.getElementById("result").style.display = "block";
}
