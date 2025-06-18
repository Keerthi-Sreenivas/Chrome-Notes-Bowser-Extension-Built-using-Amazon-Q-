'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const noteInput = document.getElementById('noteInput');
    const saveButton = document.getElementById('saveButton');
    const noteHistory = document.getElementById('noteHistory');

    // Load note history when popup opens
    loadNoteHistory();

    /**
     * Saves the current note with a timestamp
     */
    function saveNote() {
        if (noteInput.value.trim() !== '') {
            const date = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            const noteContent = noteInput.value.trim();
            const noteWithDate = `${formattedDate} ${noteContent}\n`;

            // Create a Blob with the note content
            const blob = new Blob([noteWithDate], {type: 'text/plain'});
            
            // Save the file
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: 'rough_notes.txt',
                saveAs: false
            });

            // Save to history
            saveToHistory(formattedDate, noteContent);
            
            noteInput.value = '';
        }
    }

    /**
     * Saves a note to the history storage
     * @param {string} date - Formatted date string
     * @param {string} content - Note content
     */
    function saveToHistory(date, content) {
        // Get existing history
        chrome.storage.local.get(['noteHistory'], function(result) {
            let history = result.noteHistory || [];
            
            // Add new note to the beginning of the array
            history.unshift({
                date: date,
                content: content,
                timestamp: new Date().getTime()
            });
            
            // Keep only the last 5 notes
            if (history.length > 5) {
                history = history.slice(0, 5);
            }
            
            // Save updated history
            chrome.storage.local.set({noteHistory: history}, function() {
                // Update the displayed history
                displayNoteHistory(history);
            });
        });
    }

    /**
     * Loads note history from storage
     */
    function loadNoteHistory() {
        chrome.storage.local.get(['noteHistory'], function(result) {
            const history = result.noteHistory || [];
            displayNoteHistory(history);
        });
    }

    /**
     * Displays the note history in the UI
     * @param {Array} history - Array of note history objects
     */
    function displayNoteHistory(history) {
        // Clear current history display
        noteHistory.innerHTML = '';
        
        if (history.length === 0) {
            noteHistory.innerHTML = '<p class="no-history">No recent notes</p>';
            return;
        }
        
        // Add each note to the history section
        history.forEach(function(note) {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const dateElement = document.createElement('div');
            dateElement.className = 'history-date';
            dateElement.textContent = note.date;
            
            const contentElement = document.createElement('div');
            contentElement.className = 'history-content';
            contentElement.textContent = note.content;
            
            historyItem.appendChild(dateElement);
            historyItem.appendChild(contentElement);
            noteHistory.appendChild(historyItem);
        });
    }

    // Save on button click
    saveButton.addEventListener('click', saveNote);

    // Save on Enter key press
    noteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveNote();
        }
    });
});