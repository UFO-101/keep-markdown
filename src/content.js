import {micromark} from 'micromark';

console.log('Keep Markdown extension loaded!');

// Add this near the top of the file, after the imports
let currentContentHeight = 70;  // We'll only keep track of content height now
let currentModalWidth = 75;     // Keep modal width

// Create preview panel
function createPreviewPanel(noteId) {
    console.log('Creating preview panel:', noteId);
    const preview = document.createElement('div');
    preview.className = 'keep-md-preview';
    preview.id = `keep-md-preview-${noteId}`;
    return preview;
}

function handleNoteOpen(modalNote) {
    console.log('Modal opened:', modalNote);
    
    // Check if preview already exists
    if (modalNote.querySelector('.keep-md-preview')) {
        console.log('Preview already exists');
        return;
    }

    // Find the note content within the modal
    const noteContent = modalNote.querySelector('.h1U9Be-YPqjbf');
    if (!noteContent) {
        console.log('No note content found');
        return;
    }

    // Create a flex container for side-by-side layout
    const container = document.createElement('div');
    container.className = 'keep-md-container';
    
    // Move the note content into the container
    const parent = noteContent.parentElement;
    parent.insertBefore(container, noteContent);
    container.appendChild(noteContent);

    // Create preview
    const preview = createPreviewPanel(Date.now());
    container.appendChild(preview);

    // Function to update preview
    const updatePreview = () => {
        const markdownText = noteContent.innerText
            .replace(/^"(.*)"$/gm, '$1')    // Remove surrounding quotes
            .replace(/\\n/g, '\n')          // Handle newlines
            .replace(/\\"([^"]+)\\"/g, '"$1"') // Fix escaped quotes
            .trim();
        preview.innerHTML = micromark(markdownText);
    };

    // Initial render
    updatePreview();

    // Watch for content changes
    const observer = new MutationObserver((mutations) => {
        updatePreview();
    });

    observer.observe(noteContent, {
        childList: true,
        characterData: true,
        subtree: true
    });

    console.log('Preview added:', preview.id);
}

function updateDimensions(width, height) {
    // Update stored values
    if (width) currentModalWidth = width;
    if (height) currentContentHeight = height;
    
    const style = document.createElement('style');
    style.textContent = `
        /* Modal width */
        .VIpgJd-TUo6Hb.XKSfm-L9AdLc:has(.keep-md-preview) {
            width: ${currentModalWidth}vw !important;
        }
        
        /* Content height */
        .keep-md-container {
            height: ${currentContentHeight}vh !important;
            overflow: hidden !important;
        }
        
        /* Make content areas scrollable */
        .keep-md-container .h1U9Be-YPqjbf,
        .keep-md-preview {
            height: 100% !important;
            overflow-y: auto !important;
        }
    `;
    
    // Remove any previous style element we added
    const existingStyle = document.getElementById('keep-md-modal-style');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.id = 'keep-md-modal-style';
    document.head.appendChild(style);
}

// Update the message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateModalWidth') {
        updateDimensions(message.value, null);
    } else if (message.type === 'updateModalHeight') {
        updateDimensions(null, message.value);
    }
});

// Initialize
function init() {
    console.log('Initializing Keep Markdown');
    
    // Load saved dimensions
    chrome.storage.sync.get(['modalWidth', 'modalHeight'], function(result) {
        if (result.modalWidth) currentModalWidth = result.modalWidth;
        if (result.modalHeight) currentContentHeight = result.modalHeight;
        updateDimensions();
    });
    
    // First check if modal is already open
    const existingModal = document.querySelector('.VIpgJd-TUo6Hb');
    if (existingModal) {
        console.log('Found existing modal');
        handleNoteOpen(existingModal);
    }

    // Watch for changes to the entire document
    const observer = new MutationObserver((mutations) => {
        console.log('Mutation detected:', mutations.length, 'changes');
        
        for (const mutation of mutations) {
            // Check added nodes
            for (const node of mutation.addedNodes) {
                if (node.classList?.contains('VIpgJd-TUo6Hb')) {
                    console.log('Modal added:', node);
                    handleNoteOpen(node);
                }
            }
            
            // Also check for attribute changes that might indicate modal opening
            if (mutation.type === 'attributes' && 
                mutation.target.classList?.contains('VIpgJd-TUo6Hb')) {
                console.log('Modal attributes changed:', mutation.target);
                handleNoteOpen(mutation.target);
            }
        }
    });

    // Observe everything
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

// Start when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 