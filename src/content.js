import {micromark} from 'micromark';

// Create and inject the preview panel
function createPreviewPanel() {
    const preview = document.createElement('div');
    preview.className = 'markdown-preview hidden';
    preview.id = 'markdown-preview';
    document.body.appendChild(preview);
    return preview;
}

// Handle note clicks
function handleNoteClick(event) {
    const noteElement = event.target.closest('.IZ65Hb-n0tgWb'); // Google Keep's note class
    if (!noteElement) return;

    const noteContent = noteElement.querySelector('.h1U9Be-YPqjbf'); // Note content element
    if (!noteContent) return;

    const preview = document.getElementById('markdown-preview') || createPreviewPanel();
    preview.classList.remove('hidden');
    document.body.classList.add('markdown-preview-active');

    // Get the markdown content and render it
    const markdownText = noteContent.textContent;
    const htmlContent = micromark(markdownText);
    preview.innerHTML = htmlContent;
}

// Initialize
function init() {
    // Listen for clicks on the document
    document.addEventListener('click', handleNoteClick);

    // Add close button to preview panel
    const preview = createPreviewPanel();
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = 'position:absolute;right:10px;top:10px;font-size:20px;cursor:pointer;';
    closeButton.addEventListener('click', () => {
        preview.classList.add('hidden');
        document.body.classList.remove('markdown-preview-active');
    });
    preview.appendChild(closeButton);
}

// Start when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 