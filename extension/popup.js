document.addEventListener('DOMContentLoaded', function() {
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');

    // Load saved values
    chrome.storage.sync.get(['modalWidth', 'modalHeight'], function(result) {
        if (result.modalWidth) {
            widthSlider.value = result.modalWidth;
            widthValue.textContent = result.modalWidth;
        }
        if (result.modalHeight) {
            heightSlider.value = result.modalHeight;
            heightValue.textContent = result.modalHeight;
        }
    });

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Debounced storage save function
    const saveToStorage = debounce((key, value) => {
        chrome.storage.sync.set({ [key]: value });
    }, 500); // Wait 500ms after last change before saving

    widthSlider.addEventListener('input', function() {
        const value = this.value;
        widthValue.textContent = value;
        
        // Send message to content script immediately
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'updateModalWidth',
                value: value
            });
        });

        // Debounced storage save
        saveToStorage('modalWidth', value);
    });

    heightSlider.addEventListener('input', function() {
        const value = this.value;
        heightValue.textContent = value;
        
        // Send message to content script immediately
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'updateModalHeight',
                value: value
            });
        });

        // Debounced storage save
        saveToStorage('modalHeight', value);
    });
});