const LOGO_SELECTOR = '#logo';
const TYPEWRITER_SELECTOR = 'h1, h2, h3, p, a';
const SCRIBBLE_FRAME_COUNT = 6;
const SCRIBBLE_FRAME_INTERVAL = 125; // ~8 FPS

document.addEventListener('DOMContentLoaded', () => {
    const theme = readTheme();

    applyTypewriterEffect({
        selector: TYPEWRITER_SELECTOR,
        logoSelector: LOGO_SELECTOR,
    });

    applyScribbleBullets({
        theme,
        frameCount: SCRIBBLE_FRAME_COUNT,
    });

    decorateTagline(theme);
});

function readTheme() {
    const fallback = '#e8e8e8';
    const rootStyles = getComputedStyle(document.documentElement);
    const foreground = rootStyles.getPropertyValue('--color-foreground').trim() || fallback;

    return {
        foreground,
        encodedForeground: encodeURIComponent(foreground),
    };
}

function applyTypewriterEffect({ selector, logoSelector }) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        if (element.dataset.typewriterApplied === 'true') return;
        if (!element.textContent.trim()) return;

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    return node.textContent.trim().length
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                },
            },
        );

        const textNodes = [];
        while (walker.nextNode()) {
            const current = walker.currentNode;
            const parent = current.parentNode;

            if (!parent) continue;
            if (parent instanceof HTMLElement && parent.classList.contains('char')) continue;

            textNodes.push(current);
        }

        textNodes.forEach(node => wrapTextNode(node, logoSelector));
        element.dataset.typewriterApplied = 'true';
    });
}

function wrapTextNode(node, logoSelector) {
    const text = node.textContent;
    if (!text) return;

    const parentNode = node.parentNode;
    if (!parentNode) return;

    const fragment = document.createDocumentFragment();
    const isLogo = !!(node.parentElement && node.parentElement.closest(logoSelector));

    for (const char of text) {
        if (/\s/.test(char)) {
            fragment.appendChild(document.createTextNode(char));
            continue;
        }

        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;

        const rotation = isLogo ? randomBetween(-2, 2) : randomBetween(-0.75, 0.75);
        const offsetY = isLogo ? randomBetween(-1.5, 1.5) : randomBetween(-0.5, 0.5);
        const letterSpacing = isLogo ? randomBetween(-0.4, 0.4) : randomBetween(-0.15, 0.15);
        const opacity = 0.85 + Math.random() * 0.15;
        const animationDelay = Math.random() * 0.5;
        const hue = Math.floor(Math.random() * 360);
        const rainbowColor = `hsl(${hue}, 70%, 65%)`;

        span.style.setProperty('--char-rotation', `${rotation}deg`);
        span.style.setProperty('--rainbow-color', rainbowColor);
        span.style.transform = `rotate(${rotation}deg) translateY(${offsetY}px)`;
        span.style.letterSpacing = `${letterSpacing}px`;
        span.style.opacity = opacity.toString();
        span.style.animationDelay = `${animationDelay}s`;

        if (isLogo) {
            span.style.color = rainbowColor;
        }

        fragment.appendChild(span);
    }

    parentNode.replaceChild(fragment, node);
}

function applyScribbleBullets({ theme, frameCount }) {
    const listItems = document.querySelectorAll('li');
    if (!listItems.length) return;

    listItems.forEach((li, index) => {
        const className = `scribble-${index}`;
        li.classList.add(className);

        const frames = [];
        for (let frame = 0; frame < frameCount; frame++) {
            frames.push(generateScribbleSVG(theme.encodedForeground));
        }

        const styleElement = document.createElement('style');
        styleElement.textContent = buildScribbleRule(className, frames[0]);
        document.head.appendChild(styleElement);

        let intervalId;
        li.dataset.currentFrame = '0';

        const link = li.querySelector('a');
        if (!link) return;

        link.addEventListener('mouseenter', () => {
            if (intervalId) return;

            intervalId = window.setInterval(() => {
                const currentFrame = Number(li.dataset.currentFrame) || 0;
                const nextFrame = (currentFrame + 1) % frames.length;
                li.dataset.currentFrame = String(nextFrame);
                styleElement.textContent = buildScribbleRule(className, frames[nextFrame]);
            }, SCRIBBLE_FRAME_INTERVAL);
        });

        link.addEventListener('mouseleave', () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }

            li.dataset.currentFrame = '0';
            styleElement.textContent = buildScribbleRule(className, frames[0]);
        });
    });
}

function buildScribbleRule(className, frame) {
    return `
        li.${className}::before {
            background-image: url("${frame}");
        }
    `;
}

function generateScribbleSVG(encodedColor) {
    const centerX = 6;
    const centerY = 6;
    const numStrokes = 15 + Math.floor(Math.random() * 10);
    const maxRadius = 2.5 + Math.random() * 0.8;

    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = Math.random() * maxRadius;
    const startX = centerX + Math.cos(startAngle) * startRadius;
    const startY = centerY + Math.sin(startAngle) * startRadius;

    let path = `M ${startX},${startY} `;

    for (let i = 0; i < numStrokes; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
        const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8;
        path += `L ${x},${y} `;
    }

    const strokeWidth = 0.4 + Math.random() * 0.2;
    const opacity = 0.85 + Math.random() * 0.15;

    return `data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${path}' fill='none' stroke='${encodedColor}' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round' opacity='${opacity}'/%3E%3C/svg%3E`;
}

function decorateTagline(theme) {
    const tagline = document.querySelector('.tagline');
    if (!tagline) return;

    const state = {
        svg: null,
        path1: null,
        path2: null,
        width: 0,
        height: 0,
    };

    const draw = (forceRedraw = false) => {
        const { offsetWidth: width, offsetHeight: height } = tagline;

        if (!forceRedraw && state.svg && width === state.width && height === state.height) {
            return;
        }

        state.width = width;
        state.height = height;

        if (!state.svg) {
            state.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            state.svg.style.position = 'absolute';
            state.svg.style.top = '0';
            state.svg.style.left = '0';
            state.svg.style.pointerEvents = 'none';

            state.path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            state.path1.setAttribute('fill', 'none');
            state.path1.setAttribute('stroke', theme.foreground);
            state.path1.setAttribute('stroke-width', '1.5');
            state.path1.setAttribute('opacity', '0.8');

            state.path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            state.path2.setAttribute('fill', 'none');
            state.path2.setAttribute('stroke', theme.foreground);
            state.path2.setAttribute('stroke-width', '1.2');
            state.path2.setAttribute('opacity', '0.6');

            state.svg.appendChild(state.path1);
            state.svg.appendChild(state.path2);
            tagline.appendChild(state.svg);
            state.svg.classList.add('ready');
        }

        state.svg.setAttribute('width', width);
        state.svg.setAttribute('height', height);

        const marginTop = 10;
        const marginBottom = 10;
        const marginLeft = 0;
        const marginRight = 10;

        const box1 = [
            generateWobblyLine(marginLeft, marginTop, width - marginRight, marginTop),
            generateWobblyLine(width - marginRight, marginTop, width - marginRight, height - marginBottom),
            generateWobblyLine(width - marginRight, height - marginBottom, marginLeft, height - marginBottom),
            generateWobblyLine(marginLeft, height - marginBottom, marginLeft, marginTop),
        ].join(' ');

        const offset = 3;
        const box2 = [
            generateWobblyLine(marginLeft + offset, marginTop + offset, width - marginRight - offset, marginTop + offset),
            generateWobblyLine(width - marginRight - offset, marginTop + offset, width - marginRight - offset, height - marginBottom - offset),
            generateWobblyLine(width - marginRight - offset, height - marginBottom - offset, marginLeft + offset, height - marginBottom - offset),
            generateWobblyLine(marginLeft + offset, height - marginBottom - offset, marginLeft + offset, marginTop + offset),
        ].join(' ');

        state.path1.setAttribute('d', box1);
        state.path2.setAttribute('d', box2);
    };

    draw(true);

    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => draw());
        observer.observe(tagline);
    } else {
        window.addEventListener('resize', () => draw());
    }
}

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

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
