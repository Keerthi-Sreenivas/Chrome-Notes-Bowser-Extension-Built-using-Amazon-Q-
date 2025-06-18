# Local Notes Saver - A Chrome Extension for Quick Note-Taking with Timestamps

Local Notes Saver is a lightweight Chrome extension that enables users to quickly save notes with timestamps directly to their local machine. The extension provides a clean, simple interface for capturing thoughts, ideas, or important information, automatically adding the current date to each note before saving it as a text file.

This extension focuses on simplicity and efficiency, offering a streamlined note-taking experience without the need for cloud storage or complex configurations. It features a resizable text area for comfortable note entry, keyboard shortcuts for quick saving, and automatic file organization with timestamps. The extension saves all notes to a local text file, making it perfect for users who prioritize privacy and local storage over cloud-based solutions.

## Screenshots

### Main Interface
<!-- Screenshot placeholder: Add a screenshot of the extension popup interface -->
![Extension Popup Interface](screenshots/main_interface.png)

### Saving a Note
<!-- Screenshot placeholder: Add a screenshot of saving a note in action -->
![Saving a Note](screenshots/saving_note.png)

### Recent Notes History
<!-- Screenshot placeholder: Add a screenshot showing the recent notes history section -->
![Recent Notes History](screenshots/note_history.png)

## Repository Structure
```
.
├── manifest.json         # Chrome extension manifest defining permissions and metadata
├── popup.html           # Main extension UI interface
├── popup.js             # Core extension logic for note saving functionality
├── README.md            # Project documentation
└── styles.css          # UI styling definitions for the extension popup
```

## Usage Instructions
### Prerequisites
- Google Chrome browser (version 88 or higher)
- Permissions to download files to your local system
- Write access to your downloads directory

### Installation
1. **Developer Mode Installation**
```bash
# Clone the repository
git clone [repository-url]

# Load the extension in Chrome:
1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the cloned extension directory
```

2. **From ZIP File**
```bash
# Download the latest release
1. Download extension.zip from the latest release
2. Extract the ZIP file
3. Follow the same steps as Developer Mode Installation
```

### Quick Start
1. Click the Local Notes Saver icon in your Chrome toolbar
2. Enter your note in the text area
3. Save the note either by:
   - Clicking the "Save" button
   - Pressing Enter (use Shift+Enter for new lines)

### More Detailed Examples
**Adding a Multi-line Note**
```
1. Click the extension icon
2. Type your note using Shift+Enter for line breaks:
   Meeting Notes:
   - Discussed project timeline
   - Set deadline for next week
3. Click Save or press Enter
```

The note will be saved as "rough_notes.txt" with the current date:
```
January 1, 2024 Meeting Notes:
- Discussed project timeline
- Set deadline for next week
```

### Troubleshooting
**Common Issues and Solutions**

1. **Extension Not Saving Notes**
   - Check if downloads permission is granted:
     1. Right-click extension icon
     2. Select "Manage Extension"
     3. Verify "downloads" permission is enabled
   - Ensure you have write access to your downloads folder

2. **Popup Not Opening**
   - Reset the extension:
     1. Go to chrome://extensions/
     2. Find Local Notes Saver
     3. Click the refresh icon
     4. Reload your active tabs

3. **Notes Not Formatting Correctly**
   - Clear extension data:
     1. Go to chrome://extensions/
     2. Click "Details" for Local Notes Saver
     3. Click "Clear Data"
     4. Restart Chrome

## Data Flow
The extension processes notes through a simple, secure local pipeline that transforms user input into timestamped text files.

```ascii
User Input → Format with Timestamp → Create Blob → Download File
[Textarea] → [popup.js] → [Blob API] → [Chrome Downloads API]
```

Component Interactions:
1. User enters text through the popup interface (popup.html)
2. popup.js captures the input and current timestamp
3. JavaScript creates a text Blob with formatted content
4. Chrome Downloads API saves the Blob as a local file
5. File system stores the note in the user's downloads directory
6. UI resets for the next note entry
7. All operations occur locally without external network requests