let editor; // Declare editor in a higher scope

document.getElementById("processBtn").addEventListener("click", async () => {
  const key = document.getElementById("key").value;
  if (!key) {
    alert("Please enter a localStorage key.");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject lz-string.min.js into the current tab
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["lz-string.min.js"],
  });

  // Inject and execute the decompression and formatting function
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: decompressLocalStorageValue,
      args: [key],
    },
    (results) => {
      const result = results[0].result;
      console.log("Process result:", result);
      if (result) {
        displayInJsonEditor(result);
      } else {
        displayErrorMessage("No data found or decompression failed.");
      }
    }
  );
});

function decompressLocalStorageValue(key) {
  const compressedData = localStorage.getItem(key);
  console.log("Compressed data from localStorage:", compressedData);
  if (compressedData) {
    try {
      const decompressedData = LZString.decompress(compressedData);
      console.log("Decompressed data:", decompressedData);
      return decompressedData ? JSON.parse(decompressedData) : null;
    } catch (error) {
      console.error("Decompression or parsing failed", error);
      return null;
    }
  }
  console.warn("No data found for key:", key);
  return null;
}

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
