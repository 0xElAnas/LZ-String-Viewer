# LZ String Viewer

A Chrome extension that reads and decompresses data stored in `localStorage` and `sessionStorage` using the LZ-String library. This tool helps developers view and inspect compressed data directly within the Chrome DevTools.

## Features

- View and decompress `localStorage` and `sessionStorage` data.
- Supports both compressed and uncompressed data.
- Simple and intuitive user interface.
- Minimalist design with easy-to-understand instructions.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/0xElAnas/LZ-String-Viewer.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the upper-right corner.
4. Click on the "Load unpacked" button and select the directory where you cloned the repository.

## Usage

1. Open the Chrome DevTools.
2. Navigate to the "LZ-String Viewer" tab in the DevTools.
3. Select the storage type (`localStorage` or `sessionStorage`).
4. Choose a storage key from the dropdown menu.
5. Click "Process" to view the data. If the data is compressed, it will be decompressed and displayed using JSONEditor. If the data is uncompressed, it will be displayed as-is.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any changes you'd like to make.

1. Fork the project
2. Create your feature branch (git checkout -b feature/YourFeature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push to the branch (git push origin feature/YourFeature)
5. Open a pull request

## License

This project is licensed under the MIT License.
