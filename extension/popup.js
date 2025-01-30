document.addEventListener('DOMContentLoaded', function() {
    const widthSlider = document.getElementById('width');
    const widthValue = document.getElementById('width-value');

    // Load saved width
    chrome.storage.sync.get(['modalWidth'], function(result) {
        if (result.modalWidth) {
            widthSlider.value = result.modalWidth;
            widthValue.textContent = result.modalWidth;
        }
    });

    widthSlider.addEventListener('input', function() {
        const value = this.value;
        widthValue.textContent = value;
        
        // Save to storage
        chrome.storage.sync.set({ modalWidth: value });
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'updateModalWidth',
                value: value
            });
        });
    });
});