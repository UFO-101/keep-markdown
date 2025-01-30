import {micromark} from 'micromark';

console.log('Keep Markdown extension loaded!');

// Add this near the top of the file, after the imports
let currentModalWidth = 75;  // Only keep width default

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

function updateModalDimensions(width) {
    // Update stored width value
    if (width) currentModalWidth = width;
    
    const style = document.createElement('style');
    style.textContent = `
        /* Modal width only */
        .VIpgJd-TUo6Hb.XKSfm-L9AdLc:has(.keep-md-preview) {
            width: ${currentModalWidth}vw !important;
            height: auto !important;
            max-height: 95vh !important;
        }

        /* Allow modal to scroll if content is very tall */
        .VIpgJd-TUo6Hb.XKSfm-L9AdLc:has(.keep-md-preview) .IZ65Hb-n0tgWb,
        .VIpgJd-TUo6Hb.XKSfm-L9AdLc:has(.keep-md-preview) .IZ65Hb-TBnied,
        .VIpgJd-TUo6Hb.XKSfm-L9AdLc:has(.keep-md-preview) .IZ65Hb-s2gQvd {
            height: auto !important;
            overflow-y: auto !important;
        }

        /* Container takes natural height */
        .keep-md-container {
            height: auto !important;
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

// Update the message listener to only handle width
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateModalWidth') {
        updateModalDimensions(message.value);
    }
});

// Initialize
function init() {
    console.log('Initializing Keep Markdown');
    
    // Load saved width
    chrome.storage.sync.get(['modalWidth'], function(result) {
        if (result.modalWidth) currentModalWidth = result.modalWidth;
        updateModalDimensions();
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