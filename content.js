// Chrome Notes Extension - Content Script

// This script runs in the context of web pages
// It can interact with the page content and communicate with the extension

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    sendResponse({ selectedText: window.getSelection().toString() });
  }
});

// Optional: Add a floating button for quick note creation
chrome.storage.sync.get(['settings'], function(result) {
  const settings = result.settings || {};
  
  // Only add the floating button if enabled in settings (default to false)
  if (settings.floatingButton) {
    createFloatingButton();
  }
});

function createFloatingButton() {
  // Create the button element
  const button = document.createElement('div');
  button.id = 'chrome-notes-button';
  button.innerHTML = '📝';
  button.title = 'Add to Chrome Notes';
  
  // Style the button
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#4285f4';
  button.style.color = 'white';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.fontSize = '24px';
  button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  button.style.transition = 'transform 0.2s';
  
  // Add hover effect
  button.addEventListener('mouseover', function() {
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseout', function() {
    button.style.transform = 'scale(1)';
  });
  
  // Add click handler
  button.addEventListener('click', function() {
    const selectedText = window.getSelection().toString();
    
    // If text is selected, create a note with it
    if (selectedText) {
      chrome.runtime.sendMessage({
        action: 'createNote',
        content: selectedText,
        url: window.location.href,
        title: document.title
      });
    } else {
      // Otherwise, just open the notes popup
      chrome.runtime.sendMessage({ action: 'openPopup' });
    }
  });
  
  // Add the button to the page
  document.body.appendChild(button);
}