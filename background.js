// Chrome Notes Extension - Background Script

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function() {
  console.log('Chrome Notes Extension installed');
  
  // Initialize storage with empty notes array if not exists
  chrome.storage.sync.get(['notes'], function(result) {
    if (!result.notes) {
      chrome.storage.sync.set({ notes: [] });
    }
  });
  
  // Create context menu for quick note creation
  chrome.contextMenus.create({
    id: 'createNote',
    title: 'Add to Chrome Notes',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'createNote' && info.selectionText) {
    // Get current notes
    chrome.storage.sync.get(['notes'], function(result) {
      const notes = result.notes || [];
      
      // Create new note from selection
      const newNote = {
        id: Date.now(),
        title: `Note from ${tab.title}`,
        content: info.selectionText,
        category: 'other',
        tags: [],
        lastModified: Date.now(),
        url: tab.url
      };
      
      // Add to notes array
      notes.push(newNote);
      
      // Save back to storage
      chrome.storage.sync.set({ notes }, function() {
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon48.png',
          title: 'Note Created',
          message: 'Selected text has been saved as a note'
        });
      });
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        sendResponse({
          url: tabs[0].url,
          title: tabs[0].title
        });
      }
    });
    return true; // Required for async response
  }
});