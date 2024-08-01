document.getElementById("decompressBtn").addEventListener("click", async () => {
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

  // Inject and execute the decompression function
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: decompressLocalStorageValue,
      args: [key],
    },
    (results) => {
      const result = results[0].result;
      console.log("Decompression result:", result);
      document.getElementById("result").textContent = result
        ? JSON.stringify(result, null, 2)
        : "No data found or decompression failed.";
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
