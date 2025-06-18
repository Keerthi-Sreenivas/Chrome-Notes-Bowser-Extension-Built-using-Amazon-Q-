// Chrome Notes Extension - Options Page Functionality

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const darkModeCheckbox = document.getElementById('darkMode');
  const fontSizeSelect = document.getElementById('fontSize');
  const fontFamilySelect = document.getElementById('fontFamily');
  const syncEnabledCheckbox = document.getElementById('syncEnabled');
  const maxNotesInput = document.getElementById('maxNotes');
  const contextMenuCheckbox = document.getElementById('contextMenu');
  const notificationsCheckbox = document.getElementById('notifications');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFile');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const successMessage = document.getElementById('successMessage');
  
  // Default settings
  const defaultSettings = {
    darkMode: false,
    fontSize: 'medium',
    fontFamily: 'Roboto, sans-serif',
    syncEnabled: true,
    maxNotes: 100,
    contextMenu: true,
    notifications: true
  };
  
  // Load settings
  loadSettings();
  
  // Event Listeners
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);
  exportBtn.addEventListener('click', exportNotes);
  importFileInput.addEventListener('change', importNotes);
  
  // Functions
  function loadSettings() {
    chrome.storage.sync.get(['settings'], function(result) {
      const settings = result.settings || defaultSettings;
      
      // Apply settings to form
      darkModeCheckbox.checked = settings.darkMode;
      fontSizeSelect.value = settings.fontSize;
      fontFamilySelect.value = settings.fontFamily;
      syncEnabledCheckbox.checked = settings.syncEnabled;
      maxNotesInput.value = settings.maxNotes;
      contextMenuCheckbox.checked = settings.contextMenu;
      notificationsCheckbox.checked = settings.notifications;
    });
  }
  
  function saveSettings() {
    const settings = {
      darkMode: darkModeCheckbox.checked,
      fontSize: fontSizeSelect.value,
      fontFamily: fontFamilySelect.value,
      syncEnabled: syncEnabledCheckbox.checked,
      maxNotes: parseInt(maxNotesInput.value, 10),
      contextMenu: contextMenuCheckbox.checked,
      notifications: notificationsCheckbox.checked
    };
    
    chrome.storage.sync.set({ settings }, function() {
      // Show success message
      successMessage.style.display = 'block';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);
      
      // Update context menu setting
      if (settings.contextMenu) {
        enableContextMenu();
      } else {
        disableContextMenu();
      }
    });
  }
  
  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      chrome.storage.sync.set({ settings: defaultSettings }, function() {
        loadSettings();
        
        // Show success message
        successMessage.textContent = 'Settings reset to defaults!';
        successMessage.style.display = 'block';
        setTimeout(() => {
          successMessage.style.display = 'none';
          successMessage.textContent = 'Settings saved successfully!';
        }, 3000);
        
        // Re-enable context menu
        enableContextMenu();
      });
    }
  }
  
  function exportNotes() {
    chrome.storage.sync.get(['notes'], function(result) {
      const notes = result.notes || [];
      
      // Create a blob with the notes data
      const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = `chrome-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    });
  }
  
  function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedNotes = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid format: Imported data is not an array');
        }
        
        // Confirm import
        if (confirm(`Import ${importedNotes.length} notes? This will merge with your existing notes.`)) {
          chrome.storage.sync.get(['notes'], function(result) {
            const currentNotes = result.notes || [];
            
            // Merge notes, avoiding duplicates by ID
            const mergedNotes = [...currentNotes];
            const currentIds = new Set(currentNotes.map(note => note.id));
            
            importedNotes.forEach(note => {
              if (!currentIds.has(note.id)) {
                mergedNotes.push(note);
              }
            });
            
            // Save merged notes
            chrome.storage.sync.set({ notes: mergedNotes }, function() {
              alert(`Successfully imported ${importedNotes.length} notes!`);
              importFileInput.value = ''; // Reset file input
            });
          });
        }
      } catch (error) {
        alert(`Error importing notes: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }
  
  function enableContextMenu() {
    chrome.contextMenus.create({
      id: 'createNote',
      title: 'Add to Chrome Notes',
      contexts: ['selection']
    });
  }
  
  function disableContextMenu() {
    chrome.contextMenus.remove('createNote');
  }
});