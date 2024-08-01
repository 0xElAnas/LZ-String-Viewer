let editor; // Declare editor in a higher scope
let storageType = "local"; // Default storage type

function populateDropdown(keys) {
  const keySelect = document.getElementById("keySelect");
  keySelect.innerHTML = '<option value="">Select a storage key</option>'; // Clear existing options

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

  document.querySelectorAll('input[name="storageType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      storageType = this.value;
      loadKeys();
    });
  });

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
        console.log("Decompressed response:", response); // Log the response
        if (response) {
          displayInJsonEditor(response);
        } else {
          displayErrorMessage("No data found or decompression failed.");
        }
      }
    );
  });
});

function displayInJsonEditor(data) {
  const container = document.getElementById("jsoneditor");

  // Remove existing editor if it exists
  if (editor) {
    editor.destroy();
  }

  const options = {
    mode: "view", // Enable view mode
    modes: ["view", "form", "tree", "code", "text"], // Allow switching modes
    onError: function (err) {
      console.error(err.toString());
    },
    onModeChange: function (newMode, oldMode) {
      console.log("Mode switched from", oldMode, "to", newMode);
    },
    onChange: function () {
      console.log("Data changed!");
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
