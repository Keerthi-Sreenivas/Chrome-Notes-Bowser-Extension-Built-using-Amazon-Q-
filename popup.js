// Chrome Notes Extension - Main Functionality

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const newNoteBtn = document.getElementById('newNote');
  const notesList = document.getElementById('notesList');
  const noteEditor = document.getElementById('noteEditor');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteContentInput = document.getElementById('noteContent');
  const saveNoteBtn = document.getElementById('saveNote');
  const cancelNoteBtn = document.getElementById('cancelNote');
  const searchInput = document.getElementById('searchNotes');
  const categoryFilter = document.getElementById('categoryFilter');
  const noteCategorySelect = document.getElementById('noteCategory');
  const noteTagsInput = document.getElementById('noteTags');
  const settingsBtn = document.getElementById('settingsBtn');
  const addCategoryBtn = document.getElementById('addCategory');

  // State
  let notes = [];
  let currentNoteId = null;
  let isEditing = false;

  // Initialize
  loadNotes();

  // Event Listeners
  newNoteBtn.addEventListener('click', createNewNote);
  saveNoteBtn.addEventListener('click', saveNote);
  cancelNoteBtn.addEventListener('click', closeEditor);
  searchInput.addEventListener('input', filterNotes);
  categoryFilter.addEventListener('change', filterNotes);
  addCategoryBtn.addEventListener('click', addNewCategory);
  settingsBtn.addEventListener('click', openSettings);

  // Functions
  function loadNotes() {
    chrome.storage.sync.get(['notes'], function(result) {
      if (result.notes) {
        notes = result.notes;
        renderNotes();
      } else {
        // First time use - no notes yet
        notesList.querySelector('.empty-state').style.display = 'flex';
      }
    });
  }

  function renderNotes(filteredNotes = null) {
    const notesToRender = filteredNotes || notes;
    
    // Clear the list
    notesList.innerHTML = '';
    
    if (notesToRender.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = '<p>No notes found. Click the + button to create a new note!</p>';
      notesList.appendChild(emptyState);
      return;
    }
    
    // Sort notes by last modified date (newest first)
    const sortedNotes = [...notesToRender].sort((a, b) => b.lastModified - a.lastModified);
    
    // Create note elements
    sortedNotes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note-item';
      noteElement.dataset.id = note.id;
      
      const title = document.createElement('h3');
      title.textContent = note.title || 'Untitled Note';
      
      const content = document.createElement('p');
      content.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
      
      const metaInfo = document.createElement('div');
      metaInfo.className = 'note-meta-info';
      
      const category = document.createElement('span');
      category.textContent = note.category || 'Uncategorized';
      
      const date = document.createElement('span');
      date.textContent = new Date(note.lastModified).toLocaleDateString();
      
      metaInfo.appendChild(category);
      metaInfo.appendChild(date);
      
      noteElement.appendChild(title);
      noteElement.appendChild(content);
      noteElement.appendChild(metaInfo);
      
      // Add click event to open note
      noteElement.addEventListener('click', () => openNote(note.id));
      
      notesList.appendChild(noteElement);
    });
  }

  function createNewNote() {
    isEditing = false;
    currentNoteId = Date.now(); // Use timestamp as temporary ID
    
    // Clear form
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteCategorySelect.value = 'other';
    noteTagsInput.value = '';
    
    // Show editor
    noteEditor.classList.remove('hidden');
    noteTitleInput.focus();
  }

  function openNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    isEditing = true;
    currentNoteId = id;
    
    // Fill form with note data
    noteTitleInput.value = note.title || '';
    noteContentInput.value = note.content || '';
    noteCategorySelect.value = note.category || 'other';
    noteTagsInput.value = (note.tags || []).join(', ');
    
    // Show editor
    noteEditor.classList.remove('hidden');
    noteTitleInput.focus();
  }

  function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const category = noteCategorySelect.value;
    const tags = noteTagsInput.value.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    if (!content) {
      alert('Please enter some content for your note.');
      return;
    }
    
    const note = {
      id: currentNoteId,
      title: title || 'Untitled Note',
      content,
      category,
      tags,
      lastModified: Date.now(),
      url: isEditing ? notes.find(n => n.id === currentNoteId)?.url : window.location.href
    };
    
    if (isEditing) {
      // Update existing note
      const index = notes.findIndex(n => n.id === currentNoteId);
      if (index !== -1) {
        notes[index] = note;
      }
    } else {
      // Add new note
      notes.push(note);
    }
    
    // Save to storage
    chrome.storage.sync.set({ notes }, function() {
      closeEditor();
      renderNotes();
    });
  }

  function closeEditor() {
    noteEditor.classList.add('hidden');
    currentNoteId = null;
    isEditing = false;
  }

  function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    
    let filtered = notes;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.content.toLowerCase().includes(searchTerm) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    // Filter by category
    if (categoryValue !== 'all') {
      filtered = filtered.filter(note => note.category === categoryValue);
    }
    
    renderNotes(filtered);
  }

  function addNewCategory() {
    const newCategory = prompt('Enter a new category name:');
    if (!newCategory || newCategory.trim() === '') return;
    
    const categoryName = newCategory.trim();
    
    // Add to category filter dropdown
    const option = document.createElement('option');
    option.value = categoryName.toLowerCase();
    option.textContent = categoryName;
    categoryFilter.appendChild(option);
    
    // Add to note category dropdown
    const noteOption = document.createElement('option');
    noteOption.value = categoryName.toLowerCase();
    noteOption.textContent = categoryName;
    noteCategorySelect.appendChild(noteOption);
  }

  function openSettings() {
    // For now, just open the options page
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }
});