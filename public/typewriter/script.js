const page = document.getElementById('page');
let content = [];
let cursorPosition = 0; // Tracks where we are in the content array
let indicatorTimeout = null; // Track the indicator removal timeout

// Audio context for sound generation
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Generate typewriter key press sound
function playKeySound() {
    const now = audioContext.currentTime;

    // Create a gentle "shh" sound using white noise
    const bufferSize = audioContext.sampleRate * 0.08; // 80ms of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // High-pass filter for gentle "shh" quality
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000 + Math.random() * 1000, now);
    filter.Q.setValueAtTime(0.5, now);

    // Very gentle, quick fade
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.08);
}

// Generate carriage return sound (bell-like)
function playEnterSound() {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Create a two-tone mechanical sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.setValueAtTime(200, now + 0.05);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
}

// Focus on the page immediately
page.setAttribute('tabindex', '0');
page.focus();

// Prevent default behavior and handle all keyboard input
page.addEventListener('keydown', (e) => {
    e.preventDefault();

    const key = e.key;

    if (key === 'Backspace') {
        // Move cursor back one position, but not past line boundaries
        if (cursorPosition > 0) {
            // Find the start of the current line
            let lineStart = cursorPosition - 1;
            while (lineStart >= 0 && content[lineStart].value !== '\n') {
                lineStart--;
            }
            lineStart++; // Move past the newline (or to 0 if no newline found)

            // Only move back if we're not at the start of the line
            if (cursorPosition > lineStart) {
                cursorPosition--;

                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });

                // Clear any existing timeout
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Mark this position for cursor indicator
                if (content[cursorPosition]) {
                    content[cursorPosition].showIndicator = true;
                }
            }
        }
    } else if (key.length === 1) {
        // Printable character
        playKeySound();

        // Check if typing consecutive spaces
        const isSpace = key === ' ';
        const prevChar = cursorPosition > 0 ? content[cursorPosition - 1] : null;
        const currentChar = cursorPosition < content.length ? content[cursorPosition] : null;

        // Check if previous character is a space (original or overlay)
        const prevIsSpace = prevChar && (
            prevChar.value === ' ' ||
            (prevChar.overlays && prevChar.overlays.length > 0 && prevChar.overlays[prevChar.overlays.length - 1] === ' ')
        );

        // Check if current position (where we're about to type) is a space
        const currentIsSpace = currentChar && (
            currentChar.value === ' ' ||
            (currentChar.overlays && currentChar.overlays.length > 0 && currentChar.overlays[currentChar.overlays.length - 1] === ' ')
        );

        const isConsecutiveSpace = isSpace && (prevIsSpace || currentIsSpace);

        // Clear any cursor indicators when typing (unless consecutive spaces)
        if (!isConsecutiveSpace) {
            content.forEach(char => {
                if (char.showIndicator) {
                    char.showIndicator = false;
                }
            });
            if (indicatorTimeout) {
                clearTimeout(indicatorTimeout);
                indicatorTimeout = null;
            }
        }

        if (cursorPosition < content.length) {
            // We're overlaying on an existing character
            const targetChar = content[cursorPosition];

            // If we're typing over a temporary character, replace it instead of overlaying
            if (targetChar.isTemporary) {
                targetChar.value = key;
                targetChar.isTemporary = false;
                targetChar.showIndicator = false;
                // Add random variations
                targetChar.rotation = (Math.random() - 0.5) * 1.5;
                targetChar.offsetY = (Math.random() - 0.5) * 1;
                targetChar.letterSpacing = Math.random() * 0.3 - 0.15;
                cursorPosition++;
            } else {
                // Normal overlay behavior
                if (!targetChar.overlays) {
                    targetChar.overlays = [];
                }
                targetChar.overlays.push(key);
                cursorPosition++;
            }

            // Show indicator for consecutive spaces in overlay mode
            if (isConsecutiveSpace) {
                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Show indicator on the character we just overlaid
                content[cursorPosition - 1].showIndicator = true;
            }
        } else {
            // We're at the end, add a new character
            // Add subtle random variations for typewriter effect
            const rotation = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75 degrees
            const offsetY = (Math.random() - 0.5) * 1; // -0.5 to +0.5 pixels
            const letterSpacing = Math.random() * 0.3 - 0.15; // -0.15 to +0.15 pixels

            content.push({
                value: key,
                overlays: [],
                rotation,
                offsetY,
                letterSpacing
            });
            cursorPosition++;

            // Show indicator for consecutive spaces
            if (isConsecutiveSpace) {
                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Show indicator on the space we just typed
                content[cursorPosition - 1].showIndicator = true;
            }
        }
    } else if (key === 'Enter') {
        // Insert newline at cursor position
        playEnterSound();

        // Clear all previous indicators
        content.forEach(char => {
            if (char.showIndicator) {
                char.showIndicator = false;
            }
        });
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
            indicatorTimeout = null;
        }

        if (cursorPosition < content.length) {
            content.splice(cursorPosition, 0, { value: '\n', overlays: [] });
        } else {
            content.push({ value: '\n', overlays: [] });
        }
        cursorPosition++;

        // Show indicator at the first position of the new line
        // The cursor is now at the beginning of the new line
        // We need to mark the next character position for the indicator
        // Since we're at a new line start, we'll add a temporary marker
        // that will be shown in the render function
        if (cursorPosition === content.length) {
            // At the end, add a temporary placeholder for the indicator
            console.log('Adding temporary indicator at end, cursorPosition:', cursorPosition);
            content.push({
                value: ' ',
                overlays: [],
                rotation: 0,
                offsetY: 0,
                letterSpacing: 0,
                showIndicator: true,
                isTemporary: true
            });
            console.log('Content after adding temp:', content);
        } else if (content[cursorPosition]) {
            // Show indicator at current position
            console.log('Setting indicator at existing position:', cursorPosition);
            content[cursorPosition].showIndicator = true;
        }
    }

    render();
});

// Keep focus on the page
page.addEventListener('blur', () => {
    setTimeout(() => page.focus(), 0);
});

function render() {
    page.innerHTML = '';

    content.forEach((char, index) => {
        if (char.value === '\n') {
            page.appendChild(document.createTextNode('\n'));
        } else {
            const span = document.createElement('span');
            span.className = 'char';

            // For temporary indicator characters, use invisible text
            if (char.isTemporary) {
                span.style.color = 'transparent';
                span.style.pointerEvents = 'none';
                span.textContent = char.value;
            } else {
                span.textContent = char.value;
            }

            // Apply subtle random transformations
            if (char.rotation !== undefined) {
                span.style.transform = `rotate(${char.rotation}deg) translateY(${char.offsetY}px)`;
                span.style.letterSpacing = `${char.letterSpacing}px`;
            }

            // Show cursor indicator if needed
            if (char.showIndicator) {
                console.log('Rendering indicator for char:', char);
                span.classList.add('cursor-indicator', 'fade-out');

                // Set timeout to remove the indicator after animation completes
                // Only set if we don't already have one (prevents multiple timeouts)
                if (!indicatorTimeout) {
                    indicatorTimeout = setTimeout(() => {
                        char.showIndicator = false;

                        // Remove temporary characters when indicator disappears
                        if (char.isTemporary) {
                            const tempIndex = content.indexOf(char);
                            if (tempIndex !== -1) {
                                content.splice(tempIndex, 1);
                                // Adjust cursor position if needed
                                if (cursorPosition > tempIndex) {
                                    cursorPosition--;
                                }
                            }
                        }

                        indicatorTimeout = null;
                        render();
                    }, 1300); // 1s delay + 0.3s animation
                }
            }

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
