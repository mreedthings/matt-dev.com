const page = document.getElementById('page');
let content = [];

// Focus on the page immediately
page.setAttribute('tabindex', '0');
page.focus();

// Prevent default behavior and handle all keyboard input
page.addEventListener('keydown', (e) => {
    e.preventDefault();

    const key = e.key;

    if (key === 'Backspace') {
        // Find the last character position and mark it for overlay
        if (content.length > 0) {
            const lastIndex = content.length - 1;
            const lastChar = content[lastIndex];

            // Mark this position as having an overlay
            if (!lastChar.overlays) {
                lastChar.overlays = [];
            }

            // Move cursor back (will write over this character next)
            content[lastIndex].hasOverlay = true;
        }
    } else if (key.length === 1) {
        // Printable character
        const char = {
            value: key,
            overlays: []
        };

        // Check if we should overlay on the previous character
        if (content.length > 0 && content[content.length - 1].hasOverlay) {
            content[content.length - 1].overlays.push(key);
            delete content[content.length - 1].hasOverlay;
        } else {
            content.push(char);
        }
    } else if (key === 'Enter') {
        content.push({ value: '\n', overlays: [] });
    }

    render();
});

// Keep focus on the page
page.addEventListener('blur', () => {
    setTimeout(() => page.focus(), 0);
});

function render() {
    page.innerHTML = '';

    content.forEach(char => {
        if (char.value === '\n') {
            page.appendChild(document.createTextNode('\n'));
        } else {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char.value;

            // Add overlaid characters
            if (char.overlays && char.overlays.length > 0) {
                char.overlays.forEach(overlayChar => {
                    const overlay = document.createElement('span');
                    overlay.className = 'overlay';
                    overlay.textContent = overlayChar;
                    span.appendChild(overlay);
                });
            }

            page.appendChild(span);
        }
    });
}
