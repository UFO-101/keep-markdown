import {micromark} from 'micromark';

console.log('Keep Markdown extension loaded!');

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

// Initialize
function init() {
    console.log('Initializing Keep Markdown');
    
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