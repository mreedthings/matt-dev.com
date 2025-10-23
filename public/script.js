const LOGO_SELECTOR = '#logo';
const TYPEWRITER_SELECTOR = 'h1, h2, h3, p, a';
const SCRIBBLE_FRAME_COUNT = 6;
const SCRIBBLE_FRAME_INTERVAL = 125; // ~8 FPS
const PAPER_LOGO_SELECTOR = '.paper-logo';
const PAPER_IDLE_FRAME_INTERVAL = 125; // 8 FPS
const PAPER_CRUMPLE_FRAME_INTERVAL = 110;
const PENCIL_SELECTOR = '.pencil-logo';

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
    initPaperLogo();
    initPencil();
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

function initPaperLogo() {
    const svg = document.querySelector(PAPER_LOGO_SELECTOR);
    if (!svg) return;

    const sheet = svg.querySelector('#paper-sheet');
    const highlight = svg.querySelector('#paper-highlight');
    const scribble = svg.querySelector('#paper-scribble');

    if (!sheet || !highlight || !scribble) return;

    let paperFrames = buildPaperFrames();
    let idleIndex = 0;
    let idleTimer = null;
    let crumpled = false;

    const applyFrame = frame => {
        if (!frame) return;

        if (frame.sheet) {
            sheet.setAttribute('d', frame.sheet);
        }

        if (frame.fill) {
            sheet.setAttribute('fill', `url(#${frame.fill})`);
        }

        if (frame.highlight) {
            highlight.setAttribute('d', frame.highlight);
        }

        if (frame.highlightOpacity !== undefined) {
            highlight.setAttribute('opacity', String(frame.highlightOpacity));
        }

        if (frame.scribble) {
            scribble.setAttribute('d', frame.scribble);
        }

        if (frame.scribbleOpacity !== undefined) {
            scribble.setAttribute('opacity', String(frame.scribbleOpacity));
        }

        if (frame.scribbleWidth !== undefined) {
            scribble.setAttribute('stroke-width', String(frame.scribbleWidth));
        }

        if (frame.scribbleStroke) {
            scribble.setAttribute('stroke', frame.scribbleStroke);
        }

        if (frame.ball) {
            svg.classList.add('paper-logo--ball');
        } else {
            svg.classList.remove('paper-logo--ball');
        }
    };

    const setBaseFrame = () => {
        idleIndex = 0;
        applyFrame(paperFrames.idle[0]);
    };

    const advanceIdle = () => {
        idleIndex = (idleIndex + 1) % paperFrames.idle.length;
        applyFrame(paperFrames.idle[idleIndex]);
    };

    const startIdle = () => {
        if (crumpled || idleTimer) return;
        advanceIdle();
        idleTimer = window.setInterval(advanceIdle, PAPER_IDLE_FRAME_INTERVAL);
    };

    const stopIdle = (reset = true) => {
        if (idleTimer) {
            window.clearInterval(idleTimer);
            idleTimer = null;
        }

        if (reset && !crumpled) {
            setBaseFrame();
        }
    };

    setBaseFrame();

    svg.addEventListener('mouseenter', () => {
        if (crumpled) return;
        startIdle();
    });

    svg.addEventListener('mouseleave', () => {
        if (crumpled) return;
        stopIdle(true);
    });

    svg.addEventListener('click', () => {
        if (!crumpled) {
            crumpled = true;
            stopIdle(false);
            svg.classList.add('paper-logo--animating');

            const frames = [
                paperFrames.idle[idleIndex],
                ...paperFrames.crumple,
            ];

            let index = 0;

            const run = () => {
                applyFrame(frames[index]);
                index += 1;

                if (index < frames.length) {
                    window.setTimeout(run, PAPER_CRUMPLE_FRAME_INTERVAL);
                } else {
                    svg.classList.remove('paper-logo--animating');
                    if (svg.matches(':hover')) {
                        stopIdle(true);
                        startIdle();
                    }
                }
            };

            run();
        } else {
            stopIdle(false);
            svg.classList.add('paper-logo--animating');
            paperFrames = buildPaperFrames();
            idleIndex = paperFrames.idle.length - 1;

            const frames = [
                ...paperFrames.crumple.slice().reverse(),
                paperFrames.idle[0],
            ];

            let index = 0;

            const run = () => {
                applyFrame(frames[index]);
                index += 1;

                if (index < frames.length) {
                    window.setTimeout(run, PAPER_CRUMPLE_FRAME_INTERVAL);
                } else {
                    svg.classList.remove('paper-logo--animating');
                    crumpled = false;
                    setBaseFrame();
                    if (svg.matches(':hover')) {
                        startIdle();
                    }
                }
            };

            run();
        }
    });
}

function initPencil() {
    const svg = document.querySelector(PENCIL_SELECTOR);
    if (!svg) return;

    const group = svg.querySelector('#pencil-group');
    const elements = {
        body: svg.querySelector('#pencil-body'),
        wood: svg.querySelector('#pencil-wood'),
        tip: svg.querySelector('#pencil-tip'),
        lead: svg.querySelector('#pencil-lead'),
        ferrule: svg.querySelector('#pencil-ferrule'),
        eraser: svg.querySelector('#pencil-eraser'),
        highlight: svg.querySelector('#pencil-highlight'),
        grain: svg.querySelector('#pencil-grain'),
        rings: svg.querySelector('#pencil-rings'),
        label: svg.querySelector('#pencil-label'),
    };

    if (!group || Object.values(elements).some(el => !el)) return;

    const geom = generatePencilGeometry();

    group.setAttribute('transform', `translate(${formatCoord(geom.offsetX)} ${formatCoord(geom.offsetY)})`);

    elements.body.setAttribute('d', geom.bodyPath);
    elements.body.setAttribute('fill', geom.bodyFill);
    elements.body.setAttribute('stroke', geom.outline);
    elements.body.setAttribute('stroke-width', '1.4');

    elements.wood.setAttribute('d', geom.woodPath);
    elements.wood.setAttribute('fill', geom.woodFill);
    elements.wood.setAttribute('stroke', geom.outline);
    elements.wood.setAttribute('stroke-width', '1.3');

    elements.tip.setAttribute('d', geom.tipShadePath);
    elements.tip.setAttribute('fill', geom.tipShadeFill);
    elements.tip.setAttribute('opacity', geom.tipShadeOpacity.toFixed(2));

    elements.lead.setAttribute('d', geom.leadPath);
    elements.lead.setAttribute('fill', geom.leadFill);
    elements.lead.setAttribute('stroke', geom.leadStroke);
    elements.lead.setAttribute('stroke-width', '0.9');

    elements.ferrule.setAttribute('d', geom.ferrulePath);
    elements.ferrule.setAttribute('fill', geom.ferruleFill);
    elements.ferrule.setAttribute('stroke', geom.outline);
    elements.ferrule.setAttribute('stroke-width', '1.2');

    elements.eraser.setAttribute('d', geom.eraserPath);
    elements.eraser.setAttribute('fill', geom.eraserFill);
    elements.eraser.setAttribute('stroke', geom.outline);
    elements.eraser.setAttribute('stroke-width', '1.2');

    elements.highlight.setAttribute('d', geom.highlightPath);
    elements.highlight.setAttribute('stroke', geom.highlightStroke);
    elements.highlight.setAttribute('stroke-width', geom.highlightWidth.toFixed(2));
    elements.highlight.setAttribute('opacity', geom.highlightOpacity.toFixed(2));
    elements.highlight.setAttribute('stroke-dasharray', geom.highlightDash);

    elements.grain.setAttribute('d', geom.grainPath);
    elements.grain.setAttribute('stroke', geom.grainColor);
    elements.grain.setAttribute('stroke-width', geom.grainWidth.toFixed(2));
    elements.grain.setAttribute('opacity', geom.grainOpacity.toFixed(2));
    elements.grain.setAttribute('stroke-dasharray', geom.grainDash);

    elements.rings.setAttribute('d', geom.ringsPath);
    elements.rings.setAttribute('stroke', geom.ringsColor);
    elements.rings.setAttribute('stroke-width', '1.2');

    const labelAngle = geom.labelAngle.toFixed(2);

    elements.label.textContent = 'No. 2';
    elements.label.setAttribute('x', formatCoord(geom.labelX));
    elements.label.setAttribute('y', formatCoord(geom.labelY));
    elements.label.setAttribute('font-size', geom.labelFontSize.toFixed(2));
    elements.label.setAttribute('letter-spacing', geom.labelLetterSpacing.toFixed(2));
    elements.label.setAttribute('fill', geom.labelColor);
    elements.label.setAttribute('transform', `rotate(${labelAngle} ${formatCoord(geom.labelX)} ${formatCoord(geom.labelY)})`);
    elements.label.style.paintOrder = 'stroke fill';
    elements.label.style.stroke = geom.labelStroke;
    elements.label.style.strokeWidth = '0.6';

    svg.style.setProperty('--pencil-angle', `${geom.angle.toFixed(2)}deg`);
    svg.style.setProperty('--pencil-shift-x', `${geom.shiftX.toFixed(2)}px`);
    svg.style.setProperty('--pencil-shift-y', `${geom.shiftY.toFixed(2)}px`);
}

function generatePencilGeometry() {
    const offsetX = randomBetween(6, 10);
    const offsetY = randomBetween(6, 9);

    const topY = randomBetween(4, 6.5);
    const height = randomBetween(12.5, 14.5);
    const bottomY = topY + height;

    const bodyStartX = randomBetween(40, 45);
    let bodyEndX = bodyStartX + randomBetween(56, 68);

    const ferruleLength = randomBetween(7, 8.4);
    const eraserLength = randomBetween(8.5, 10.5);
    const woodLength = randomBetween(6.2, 7.4);
    const tipLength = randomBetween(6.8, 8);

    const maxRight = 118;
    const totalRight = bodyEndX + ferruleLength + eraserLength;
    if (totalRight > maxRight) {
        bodyEndX -= totalRight - maxRight;
    }

    const woodStartX = bodyStartX - woodLength;
    const tipEndX = woodStartX - tipLength;
    const tipMidY = (topY + bottomY) / 2 + randomBetween(-0.8, 0.8);

    const bodyTopLeft = {
        x: bodyStartX + randomBetween(-0.6, 0.6),
        y: topY + randomBetween(-0.4, 0.4),
    };
    const bodyBottomLeft = {
        x: bodyStartX + randomBetween(-0.6, 0.6),
        y: bottomY + randomBetween(-0.4, 0.4),
    };
    const bodyTopRight = {
        x: bodyEndX + randomBetween(-0.6, 0.6),
        y: topY + randomBetween(-0.4, 0.4),
    };
    const bodyBottomRight = {
        x: bodyEndX + randomBetween(-0.6, 0.6),
        y: bottomY + randomBetween(-0.4, 0.4),
    };

    const bodyPath = pathFromPoints([
        [bodyTopLeft.x, bodyTopLeft.y],
        [bodyTopRight.x, bodyTopRight.y],
        [bodyBottomRight.x, bodyBottomRight.y],
        [bodyBottomLeft.x, bodyBottomLeft.y],
    ]);

    const leadTip = {
        x: tipEndX - randomBetween(0.4, 0.65),
        y: tipMidY + randomBetween(-0.12, 0.12),
    };

    const woodApex = {
        x: leadTip.x + randomBetween(0.55, 0.72),
        y: tipMidY + randomBetween(-0.3, 0.3),
    };

    const woodBaseTop = {
        x: bodyTopLeft.x + randomBetween(-0.25, 0.2),
        y: bodyTopLeft.y + randomBetween(-0.2, 0.2),
    };
    const woodBaseBottom = {
        x: bodyBottomLeft.x + randomBetween(-0.25, 0.2),
        y: bodyBottomLeft.y + randomBetween(-0.2, 0.2),
    };

    const woodPath = pathFromPoints([
        [woodBaseTop.x, woodBaseTop.y],
        [woodApex.x, woodApex.y],
        [woodBaseBottom.x, woodBaseBottom.y],
    ]);

    const tipShadePath = pathFromPoints([
        [
            woodBaseTop.x - randomBetween(0.5, 1),
            lerp(woodBaseTop.y, woodApex.y, 0.45) + randomBetween(-0.3, 0.3),
        ],
        [woodApex.x + randomBetween(-0.2, 0.2), woodApex.y + randomBetween(-0.15, 0.15)],
        [
            woodBaseBottom.x - randomBetween(0.5, 1),
            lerp(woodBaseBottom.y, woodApex.y, 0.55) + randomBetween(-0.3, 0.3),
        ],
    ]);

    const leadBaseX = woodApex.x - randomBetween(0.12, 0.18);
    const leadPath = pathFromPoints([
        [leadTip.x, leadTip.y],
        [leadBaseX, woodApex.y - randomBetween(0.46, 0.62)],
        [leadBaseX + randomBetween(-0.06, 0.06), woodApex.y + randomBetween(0.46, 0.62)],
    ]);

    const ferruleTopLeft = {
        x: bodyTopRight.x + randomBetween(-0.3, 0.3),
        y: bodyTopRight.y + randomBetween(-0.3, 0.3),
    };
    const ferruleBottomLeft = {
        x: bodyBottomRight.x + randomBetween(-0.3, 0.3),
        y: bodyBottomRight.y + randomBetween(-0.3, 0.3),
    };
    const ferruleTopRight = {
        x: ferruleTopLeft.x + ferruleLength + randomBetween(-0.6, 0.6),
        y: ferruleTopLeft.y + randomBetween(-0.3, 0.3),
    };
    const ferruleBottomRight = {
        x: ferruleBottomLeft.x + ferruleLength + randomBetween(-0.6, 0.6),
        y: ferruleBottomLeft.y + randomBetween(-0.3, 0.3),
    };

    const ferrulePath = pathFromPoints([
        [ferruleTopLeft.x, ferruleTopLeft.y],
        [ferruleTopRight.x, ferruleTopRight.y],
        [ferruleBottomRight.x, ferruleBottomRight.y],
        [ferruleBottomLeft.x, ferruleBottomLeft.y],
    ]);

    const eraserTopLeft = {
        x: ferruleTopRight.x + randomBetween(-0.2, 0.2),
        y: ferruleTopRight.y + randomBetween(-0.1, 0.3),
    };
    const eraserBottomLeft = {
        x: ferruleBottomRight.x + randomBetween(-0.2, 0.2),
        y: ferruleBottomRight.y - randomBetween(0.1, 0.3),
    };
    const eraserTopRight = {
        x: eraserTopLeft.x + eraserLength + randomBetween(-0.4, 0.4),
        y: eraserTopLeft.y + randomBetween(-0.1, 0.3),
    };
    const eraserBottomRight = {
        x: eraserBottomLeft.x + eraserLength + randomBetween(-0.4, 0.4),
        y: eraserBottomLeft.y + randomBetween(-0.3, 0.3),
    };

    const eraserPath = pathFromPoints([
        [eraserTopLeft.x, eraserTopLeft.y],
        [eraserTopRight.x, eraserTopRight.y],
        [eraserBottomRight.x, eraserBottomRight.y],
        [eraserBottomLeft.x, eraserBottomLeft.y],
    ]);

    const highlightPoints = [];
    const highlightSegments = 4;
    for (let i = 0; i <= highlightSegments; i++) {
        const t = i / highlightSegments;
        const x = lerp(bodyTopLeft.x, bodyTopRight.x, t) + randomBetween(-0.7, 0.7);
        const y = lerp(bodyTopLeft.y, bodyTopRight.y, t) + randomBetween(-0.8, -0.15);
        highlightPoints.push([x, y]);
    }

    const grainPoints = [];
    const grainSegments = 3;
    for (let i = 0; i <= grainSegments; i++) {
        const t = i / grainSegments;
        const x = lerp(bodyTopLeft.x, bodyTopRight.x, t) + randomBetween(-0.6, 0.6);
        const y = lerp(bodyTopLeft.y, bodyBottomLeft.y, 0.55) + randomBetween(-0.5, 0.5);
        grainPoints.push([x, y]);
    }

    const ringTop = lerp(ferruleTopLeft.y, ferruleBottomLeft.y, 0.1) + randomBetween(-0.2, 0.2);
    const ringBottom = lerp(ferruleTopLeft.y, ferruleBottomLeft.y, 0.9) + randomBetween(-0.2, 0.2);
    const ring1X = lerp(ferruleTopLeft.x, ferruleTopRight.x, randomBetween(0.25, 0.4));
    const ring2X = lerp(ferruleTopLeft.x, ferruleTopRight.x, randomBetween(0.58, 0.78));

    const ringsPath = [
        `M ${formatCoord(ring1X + randomBetween(-0.15, 0.15))} ${formatCoord(ringTop)}`,
        `L ${formatCoord(ring1X + randomBetween(-0.15, 0.15))} ${formatCoord(ringBottom)}`,
        `M ${formatCoord(ring2X + randomBetween(-0.15, 0.15))} ${formatCoord(ringTop + randomBetween(-0.2, 0.2))}`,
        `L ${formatCoord(ring2X + randomBetween(-0.15, 0.15))} ${formatCoord(ringBottom + randomBetween(-0.2, 0.2))}`,
    ].join(' ');

    const bodyHue = randomBetween(46, 52);
    const bodySaturation = randomBetween(72, 85);
    const bodyLightness = randomBetween(52, 60);

    const bodyFill = `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)`;
    const outline = `hsl(30, 45%, 18%)`;
    const woodFill = `hsl(${randomBetween(30, 36)}, ${randomBetween(38, 52)}%, ${randomBetween(60, 70)}%)`;
    const tipShadeFill = `hsla(${randomBetween(30, 36)}, 42%, 50%, 0.22)`;
    const leadFill = `hsl(18, 20%, 8%)`;
    const leadStroke = `hsla(20, 48%, 4%, 0.82)`;
    const ferruleFill = `hsl(${randomBetween(34, 40)}, ${randomBetween(18, 26)}%, ${randomBetween(64, 72)}%)`;
    const eraserFill = `hsl(${randomBetween(346, 354)}, ${randomBetween(66, 78)}%, ${randomBetween(72, 78)}%)`;
    const highlightStroke = `hsla(${bodyHue}, ${Math.max(45, bodySaturation - 22)}%, ${Math.min(88, bodyLightness + 24)}%, 0.85)`;
    const grainColor = `hsla(${bodyHue - randomBetween(8, 12)}, ${Math.max(38, bodySaturation - 30)}%, ${Math.max(32, bodyLightness - 18)}%, 0.7)`;
    const ringsColor = `hsla(30, 28%, 32%, 0.85)`;
    const labelColor = `hsl(${bodyHue - 12}, ${Math.max(32, bodySaturation - 45)}%, ${Math.max(28, bodyLightness - 26)}%)`;
    const labelStroke = `hsla(${bodyHue - 14}, 46%, 18%, 0.75)`;

    const labelX = bodyStartX + (bodyEndX - bodyStartX) * randomBetween(0.38, 0.6);
    const labelY = topY + height * randomBetween(0.46, 0.62);
    const labelFontSize = randomBetween(5.8, 7.4);
    const labelLetterSpacing = randomBetween(0.45, 1.2);
    const labelAngle = randomBetween(-3.5, 3.5);

    return {
        offsetX,
        offsetY,
        bodyPath,
        woodPath,
        tipShadePath,
        leadPath,
        ferrulePath,
        eraserPath,
        highlightPath: smoothPath(highlightPoints),
        grainPath: smoothPath(grainPoints),
        ringsPath,
        bodyFill,
        woodFill,
        tipShadeFill,
        tipShadeOpacity: 0.22 + Math.random() * 0.18,
        leadFill,
        leadStroke,
        ferruleFill,
        eraserFill,
        highlightStroke,
        highlightWidth: randomBetween(1, 1.35),
        highlightOpacity: 0.58 + Math.random() * 0.2,
        highlightDash: `${randomBetween(2.6, 4.2).toFixed(1)} ${randomBetween(3.2, 5.1).toFixed(1)}`,
        grainColor,
        grainWidth: randomBetween(0.9, 1.25),
        grainOpacity: 0.55 + Math.random() * 0.25,
        grainDash: `${randomBetween(1.1, 1.8).toFixed(1)} ${randomBetween(2.4, 3.6).toFixed(1)}`,
        ringsColor,
        outline,
        labelX,
        labelY,
        labelFontSize,
        labelLetterSpacing,
        labelColor,
        labelStroke,
        labelAngle,
        angle: randomBetween(-20, -12),
        shiftX: randomBetween(-24, -10),
        shiftY: randomBetween(-22, -10),
    };
}

function pathFromPoints(points, close = true) {
    if (!points.length) return '';

    const [first, ...rest] = points;
    let d = `M ${formatCoord(first[0])} ${formatCoord(first[1])}`;

    rest.forEach(([x, y]) => {
        d += ` L ${formatCoord(x)} ${formatCoord(y)}`;
    });

    if (close) {
        d += ' Z';
    }

    return d;
}

function smoothPath(points) {
    if (points.length < 2) return '';

    let d = `M ${formatCoord(points[0][0])} ${formatCoord(points[0][1])}`;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const current = points[i];
        const cx = (prev[0] + current[0]) / 2 + randomBetween(-1, 1);
        const cy = (prev[1] + current[1]) / 2 + randomBetween(-1, 1);
        d += ` Q ${formatCoord(cx)} ${formatCoord(cy)} ${formatCoord(current[0])} ${formatCoord(current[1])}`;
    }

    return d;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

const PAPER_IDLE_FRAME_TEMPLATES = [
    {
        sheet: 'M28 12 L72 12 Q84 26 82 78 L26 80 Q22 56 22 18 Z',
        highlight: 'M30 22 L66 20 Q70 31 68 48 L30 50 Z',
        highlightOpacity: 0.35,
        scribbleOpacity: 0.65,
        scribbleWidth: 1.2,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M27 13 L71 13 Q83 28 80 79 L25 81 Q20 57 22 19 Z',
        highlight: 'M29 22 L64 20 Q68 32 66 48 L29 49 Z',
        highlightOpacity: 0.33,
        scribbleOpacity: 0.6,
        scribbleWidth: 1.15,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M29 14 L71 14 Q82 28 80 78 L26 80 Q22 56 23 19 Z',
        highlight: 'M31 22 L64 21 Q68 33 66 49 L31 50 Z',
        highlightOpacity: 0.33,
        scribbleOpacity: 0.68,
        scribbleWidth: 1.1,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M28 13 L72 13 Q84 29 81 79 L26 81 Q21 57 23 19 Z',
        highlight: 'M30 22 L63 21 Q68 33 66 48 L30 49 Z',
        highlightOpacity: 0.34,
        scribbleOpacity: 0.62,
        scribbleWidth: 1.15,
        fill: 'paper-flat-fill',
    },
];

const PAPER_CRUMPLE_FRAME_TEMPLATES = [
    {
        sheet: 'M24 26 Q52 12 74 20 Q86 38 74 64 Q46 74 24 66 Z',
        highlight: 'M36 32 Q52 24 64 30 Q62 38 46 42 Q34 38 36 32 Z',
        highlightOpacity: 0.3,
        scribbleOpacity: 0.58,
        scribbleWidth: 1.1,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M30 32 Q54 18 70 30 Q80 42 66 58 Q46 64 32 56 Z',
        highlight: 'M40 36 Q52 28 62 32 Q60 40 48 44 Q38 42 40 36 Z',
        highlightOpacity: 0.28,
        scribbleOpacity: 0.55,
        scribbleWidth: 1.05,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M36 38 Q54 22 66 34 Q72 44 58 56 Q44 58 36 50 Z',
        highlight: 'M42 40 Q52 32 60 38 Q58 44 48 48 Q40 46 42 40 Z',
        highlightOpacity: 0.26,
        scribbleOpacity: 0.52,
        scribbleWidth: 1,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M40 42 Q52 28 62 38 Q68 46 56 54 Q46 54 40 48 Z',
        highlight: 'M44 44 Q52 36 58 40 Q56 44 48 48 Q42 46 44 44 Z',
        highlightOpacity: 0.24,
        scribbleOpacity: 0.48,
        scribbleWidth: 0.95,
        fill: 'paper-flat-fill',
    },
    {
        sheet: 'M40 44 Q52 30 66 42 Q70 50 60 60 Q46 62 38 52 Z',
        highlight: 'M44 46 Q52 38 60 42 Q58 48 50 52 Q44 50 44 46 Z',
        highlightOpacity: 0.22,
        scribbleOpacity: 0.45,
        scribbleWidth: 0.9,
        fill: 'paper-ball-fill',
        ball: true,
        scribbleStroke: '#4f483c',
    },
    {
        sheet: 'M42 46 Q54 32 64 44 Q68 52 58 60 Q48 62 42 54 Z',
        highlight: 'M46 48 Q54 40 60 46 Q56 50 50 54 Q46 52 46 48 Z',
        highlightOpacity: 0.2,
        scribbleOpacity: 0.42,
        scribbleWidth: 0.85,
        fill: 'paper-ball-fill',
        ball: true,
        scribbleStroke: '#4f483c',
    },
];

function buildPaperFrames() {
    const sketch = generatePaperSketchData();

    const idle = PAPER_IDLE_FRAME_TEMPLATES.map(template => ({
        ...template,
        scribble: sketch.path,
        scribbleStroke: sketch.stroke,
    }));

    const crumple = PAPER_CRUMPLE_FRAME_TEMPLATES.map(template => ({
        ...template,
        scribble: sketch.path,
        scribbleStroke: template.scribbleStroke || sketch.stroke,
    }));

    return { idle, crumple };
}

function generatePaperSketchData() {
    const path = createSketchPath({
        minX: 32,
        maxX: 68,
        minY: 28,
        maxY: 68,
    });

    const hue = Math.round(randomBetween(32, 48));
    const saturation = Math.round(randomBetween(12, 24));
    const lightness = Math.round(randomBetween(28, 42));
    const stroke = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    return { path, stroke };
}

function createSketchPath({ minX, maxX, minY, maxY }) {
    const segmentCount = 4 + Math.floor(Math.random() * 4);
    let x = randomBetween(minX, maxX);
    let y = randomBetween(minY, maxY);
    let d = `M ${formatCoord(x)} ${formatCoord(y)}`;

    for (let i = 0; i < segmentCount; i++) {
        const controlX = randomBetween(minX, maxX);
        const controlY = randomBetween(minY, maxY);
        x = randomBetween(minX, maxX);
        y = randomBetween(minY, maxY);

        d += ` Q ${formatCoord(controlX)} ${formatCoord(controlY)} ${formatCoord(x)} ${formatCoord(y)}`;

        if (Math.random() < 0.4) {
            const driftX = randomBetween(minX, maxX);
            const driftY = randomBetween(minY, maxY);
            d += ` T ${formatCoord(driftX)} ${formatCoord(driftY)}`;
            x = driftX;
            y = driftY;
        }
    }

    if (Math.random() < 0.6) {
        const centerX = randomBetween(minX + 6, maxX - 6);
        const centerY = randomBetween(minY + 6, maxY - 6);
        const radiusX = randomBetween(3, 7);
        const radiusY = randomBetween(2, 6);
        const leftX = centerX - radiusX;
        const rightX = centerX + radiusX;
        const topY = centerY - radiusY;
        const bottomY = centerY + radiusY;

        d += ` M ${formatCoord(leftX)} ${formatCoord(centerY)}`;
        d += ` C ${formatCoord(leftX)} ${formatCoord(topY)} ${formatCoord(rightX)} ${formatCoord(topY)} ${formatCoord(rightX)} ${formatCoord(centerY)}`;
        d += ` C ${formatCoord(rightX)} ${formatCoord(bottomY)} ${formatCoord(leftX)} ${formatCoord(bottomY)} ${formatCoord(leftX)} ${formatCoord(centerY)}`;
    }

    if (Math.random() < 0.45) {
        const zigStartX = randomBetween(minX + 4, maxX - 4);
        const zigStartY = randomBetween(minY + 4, maxY - 4);
        const zigWidth = randomBetween(6, 12);
        const zigHeight = randomBetween(4, 10);

        const points = [
            [zigStartX, zigStartY],
            [zigStartX + zigWidth / 2, zigStartY - zigHeight],
            [zigStartX + zigWidth, zigStartY],
            [zigStartX + zigWidth / 2, zigStartY + zigHeight],
            [zigStartX, zigStartY],
        ];

        d += ` M ${formatCoord(points[0][0])} ${formatCoord(points[0][1])}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${formatCoord(points[i][0])} ${formatCoord(points[i][1])}`;
        }
    }

    return d;
}

function formatCoord(value) {
    const fixed = value.toFixed(1);
    return fixed === '-0.0' ? '0' : fixed;
}
