// Apply typewriter character variations to text content
document.addEventListener('DOMContentLoaded', () => {

    // Get all text nodes in the main content
    const elementsToStyle = document.querySelectorAll('h1, h2, h3, p, a');

    elementsToStyle.forEach(element => {
        // Skip if element is empty or only whitespace
        if (!element.textContent.trim()) return;

        // Check if this is the h1 header
        const isHeader = element.tagName === 'H1' && element.id === 'logo';

        // Get the text content
        const text = element.textContent;

        // Clear the element
        element.textContent = '';

        // Wrap each character in a span with random variations
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // For whitespace, just add as text node
            if (char === ' ' || char === '\n' || char === '\t') {
                element.appendChild(document.createTextNode(char));
                continue;
            }

            // Create span for character
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;

            // Add subtle random variations for typewriter effect
            // Extra wobble for logo to make it look hand-drawn
            const rotation = isHeader
                ? (Math.random() - 0.5) * 4  // -2 to +2 degrees for logo
                : (Math.random() - 0.5) * 1.5; // -0.75 to +0.75 degrees for others
            const offsetY = isHeader
                ? (Math.random() - 0.5) * 3  // More vertical offset for logo
                : (Math.random() - 0.5) * 1;
            const letterSpacing = isHeader
                ? Math.random() * 0.8 - 0.4  // More spacing variation
                : Math.random() * 0.3 - 0.15;
            const opacity = 0.85 + Math.random() * 0.15; // Vary between 0.85 and 1.0
            const animationDelay = Math.random() * 0.5; // Random delay 0-0.5s for independent movement

            // Random rainbow color for hover animation (and permanent for h1)
            const hue = Math.floor(Math.random() * 360);
            const rainbowColor = `hsl(${hue}, 70%, 65%)`;

            // Apply transformations
            span.style.setProperty('--char-rotation', `${rotation}deg`);
            span.style.setProperty('--rainbow-color', rainbowColor);
            span.style.transform = `rotate(${rotation}deg) translateY(${offsetY}px)`;
            span.style.letterSpacing = `${letterSpacing}px`;
            span.style.opacity = opacity;
            span.style.animationDelay = `${animationDelay}s`;

            // If it's the h1 header, apply rainbow color permanently
            if (isHeader) {
                span.style.color = rainbowColor;
            }

            element.appendChild(span);
        }
    });

    // Generate random scribble bullets
    function generateScribbleSVG() {
        // Create a chaotic scribbled dot - like rapidly scribbling back and forth
        const centerX = 6;
        const centerY = 6;
        const numStrokes = 15 + Math.floor(Math.random() * 10); // 15-25 chaotic strokes

        let path = '';
        const maxRadius = 2.5 + Math.random() * 0.8;

        // Start from a random point
        const startAngle = Math.random() * Math.PI * 2;
        const startRadius = Math.random() * maxRadius;
        const startX = centerX + Math.cos(startAngle) * startRadius;
        const startY = centerY + Math.sin(startAngle) * startRadius;
        path += `M ${startX},${startY} `;

        // Create chaotic back-and-forth scribbles
        for (let i = 0; i < numStrokes; i++) {
            // Randomly jump around within the dot area
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxRadius;

            const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
            const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8;

            path += `L ${x},${y} `;
        }

        const strokeWidth = 0.4 + Math.random() * 0.2;
        const opacity = 0.85 + Math.random() * 0.15;

        const svg = `data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${path}' fill='none' stroke='%23e8e8e8' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round' opacity='${opacity}'/%3E%3C/svg%3E`;
        return svg;
    }

    // Apply random scribbles to each list item
    const listItems = document.querySelectorAll('li');
    listItems.forEach((li, index) => {
        const scribbleSVG = generateScribbleSVG();
        // Create a unique class for each list item
        const className = `scribble-${index}`;
        li.classList.add(className);

        // Generate multiple frames for animation (12 fps = 12 frames per second)
        const frames = [scribbleSVG];
        for (let i = 0; i < 5; i++) {
            frames.push(generateScribbleSVG());
        }

        // Store frames for animation
        li.dataset.frames = JSON.stringify(frames);
        li.dataset.currentFrame = '0';

        // Inject a style tag with the specific background for this li::before
        const style = document.createElement('style');
        style.textContent = `
            li.${className}::before {
                background-image: url("${scribbleSVG}");
            }
        `;
        document.head.appendChild(style);

        // Animate bullet on link hover
        const link = li.querySelector('a');
        let animationInterval = null;

        if (link) {
            link.addEventListener('mouseenter', () => {
                // Start animation at 8 fps (every 125ms)
                animationInterval = setInterval(() => {
                    const currentFrame = parseInt(li.dataset.currentFrame);
                    const nextFrame = (currentFrame + 1) % frames.length;
                    li.dataset.currentFrame = nextFrame.toString();

                    // Update the background image
                    const styleEl = document.querySelector(`style:has(+ *), head style`);
                    const newStyle = document.createElement('style');
                    newStyle.textContent = `
                        li.${className}::before {
                            background-image: url("${frames[nextFrame]}");
                        }
                    `;
                    // Replace old style
                    const oldStyles = Array.from(document.head.querySelectorAll('style'));
                    const targetStyle = oldStyles.find(s => s.textContent.includes(className));
                    if (targetStyle) {
                        targetStyle.textContent = newStyle.textContent;
                    }
                }, 125); // 8 fps
            });

            link.addEventListener('mouseleave', () => {
                clearInterval(animationInterval);
                // Reset to first frame
                li.dataset.currentFrame = '0';
                const oldStyles = Array.from(document.head.querySelectorAll('style'));
                const targetStyle = oldStyles.find(s => s.textContent.includes(className));
                if (targetStyle) {
                    targetStyle.textContent = `
                        li.${className}::before {
                            background-image: url("${frames[0]}");
                        }
                    `;
                }
            });
        }
    });

    // Create hand-drawn box around tagline
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        let svg = null;
        let path1 = null;
        let path2 = null;
        let lastWidth = 0;
        let lastHeight = 0;

        function drawTaglineBox(forceRedraw = false) {
            const width = tagline.offsetWidth;
            const height = tagline.offsetHeight;

            // Skip if dimensions haven't changed (prevents flicker on refresh)
            if (!forceRedraw && width === lastWidth && height === lastHeight && svg) {
                return;
            }

            lastWidth = width;
            lastHeight = height;

            // Generate wobbly box path with double lines
            function generateWobblyLine(x1, y1, x2, y2, segments = 20) {
                let path = `M ${x1},${y1}`;
                const dx = (x2 - x1) / segments;
                const dy = (y2 - y1) / segments;

                for (let i = 1; i <= segments; i++) {
                    const x = x1 + dx * i + (Math.random() - 0.5) * 2;
                    const y = y1 + dy * i + (Math.random() - 0.5) * 2;
                    path += ` L ${x},${y}`;
                }
                return path;
            }

            const marginTop = 10;
            const marginBottom = 10;
            const marginLeft = 0;
            const marginRight = 10;

            // Create SVG on first run
            if (!svg) {
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                svg.style.pointerEvents = 'none';

                // First box (main outline)
                path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path1.setAttribute('fill', 'none');
                path1.setAttribute('stroke', '#e8e8e8');
                path1.setAttribute('stroke-width', '1.5');
                path1.setAttribute('opacity', '0.8');

                // Second box (traced outline with offset)
                path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path2.setAttribute('fill', 'none');
                path2.setAttribute('stroke', '#e8e8e8');
                path2.setAttribute('stroke-width', '1.2');
                path2.setAttribute('opacity', '0.6');

                svg.appendChild(path1);
                svg.appendChild(path2);
                tagline.appendChild(svg);
                svg.classList.add('ready');
            }

            // Update SVG dimensions
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);

            // Generate and update paths
            const box1 =
                generateWobblyLine(marginLeft, marginTop, width - marginRight, marginTop) + ' ' +
                generateWobblyLine(width - marginRight, marginTop, width - marginRight, height - marginBottom) + ' ' +
                generateWobblyLine(width - marginRight, height - marginBottom, marginLeft, height - marginBottom) + ' ' +
                generateWobblyLine(marginLeft, height - marginBottom, marginLeft, marginTop);

            const offset = 3;
            const box2 =
                generateWobblyLine(marginLeft + offset, marginTop + offset, width - marginRight - offset, marginTop + offset) + ' ' +
                generateWobblyLine(width - marginRight - offset, marginTop + offset, width - marginRight - offset, height - marginBottom - offset) + ' ' +
                generateWobblyLine(width - marginRight - offset, height - marginBottom - offset, marginLeft + offset, height - marginBottom - offset) + ' ' +
                generateWobblyLine(marginLeft + offset, height - marginBottom - offset, marginLeft + offset, marginTop + offset);

            path1.setAttribute('d', box1);
            path2.setAttribute('d', box2);
        }

        // Initial draw - do it immediately
        drawTaglineBox();

        // Redraw on window resize
        let boxResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(boxResizeTimeout);
            boxResizeTimeout = setTimeout(drawTaglineBox, 50);
        });
    }
});
