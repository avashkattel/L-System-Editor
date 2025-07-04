import { Color } from 'three';

export interface RuleSet { [key: string]: string; }
type LSystemState = { x: number; y: number; angle: number };
type Point = { x: number; y: number };
type Segment = { start: Point; end: Point };

const presets = {
    "Arsa Tree": { axiom: "X", rules: { X: "F[+X][-X]FX", F: "FF" }, angle: 18, iterations: 8, startAngle: 90 },
    "Fractal Tree": { axiom: "F", rules: { F: "F[+F]F[-F]F" }, angle: 25.7, iterations: 5, startAngle: 90 },
    "Complex Plant": { axiom: "X", rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" }, angle: 25, iterations: 6, startAngle: 90 },
    "Feathery Bush": { axiom: "Y", rules: { Y: "YFX[+Y][-Y]", X: "X[-FFF][+FFF]FX" }, angle: 25.7, iterations: 5, startAngle: 90 },
    "Seaweed": { axiom: "F", rules: { F: "FF-[-F+F+F]+[+F-F-F]" }, angle: 22.5, iterations: 4, startAngle: 90 },
    "Sticks": { axiom: "X", rules: { X: "F[+X]F[-X]+X", F: "FF" }, angle: 20, iterations: 7, startAngle: 90 },
    "Koch Snowflake": { axiom: "F++F++F", rules: { F: "F-F++F-F" }, angle: 60, iterations: 4, startAngle: 90 },
    "Sierpinski Triangle": { axiom: "F-G-G", rules: { F: "F-G+F+G-F", G: "GG" }, angle: 120, iterations: 6, startAngle: 90 },
    "Dragon Curve": { axiom: "FX", rules: { X: "X+YF+", Y: "-FX-Y" }, angle: 90, iterations: 11, startAngle: 90 },
    "Hilbert Curve": { axiom: "A", rules: { A: "-BF+AFA+FB-", B: "+AF-BFB-FA+" }, angle: 90, iterations: 6, startAngle: 90 },
    "Sierpinski Carpet": { axiom: "F", rules: { F: "F+F-F-F-G+F+F+F-F", G: "GGG" }, angle: 90, iterations: 4, startAngle: 90 },
    "Penrose Tiling P2": { axiom: "[X]++[X]++[X]++[X]++[X]", rules: { W: "YF++ZF----XF[-YF----WF]++", X: "+YF--ZF[---WF--XF]+", Y: "-WF++XF[+++YF++ZF]-", Z: "--YF++++WF[+ZF++++XF]--XF" }, angle: 36, iterations: 4, startAngle: 90 },
    "Pentaplexity": { axiom: "F++F++F++F++F", rules: { F: "F++F++F+++++F-F++F" }, angle: 36, iterations: 4, startAngle: 90 },
    "Crystal Growth": { axiom: "F+F+F+F", rules: { F: "FF+F++F+F" }, angle: 90, iterations: 4, startAngle: 90 },
    "Moore Curve": { axiom: "LFL-F-LFL", rules: { L: "+RF-LFL-FR+", R: "-LF+RFR+FL-" }, angle: 90, iterations: 4, startAngle: 90 },
    "Peano Curve": { axiom: "X", rules: { X: "XFYFX+F+YFXFY-F-XFYFX", Y: "YFXFY-F-XFYFX+F+YFXFY" }, angle: 90, iterations: 3, startAngle: 90 },
    "Rings": { axiom: "F+F+F+F", rules: { F: "FF+F+F+F+F+F-F"}, angle: 90, iterations: 6, startAngle: 90 },
    "Hexagonal Gosper": { axiom: "XF", rules: { X: "X+YF++YF-FX--FXFX-YF+", Y: "-FX+YFYF++YF+FX--FX-Y" }, angle: 60, iterations: 3, startAngle: 90 },
    "Quadratic Snowflake": { axiom: "F+F+F+F", rules: { F: "F-F+F+F-F" }, angle: 90, iterations: 4, startAngle: 90 },
    "Levy C Curve": { axiom: "F", rules: { F: "+F--F+" }, angle: 45, iterations: 12, startAngle: 90 },
    "McWhorter's Pentigree": { axiom: "F-F-F-F-F", rules: { F: "F-F++F+F-F-F" }, angle: 72, iterations: 4, startAngle: 90 },
    "Krishna Anklet": { axiom: "-X--X", rules: { X: "XFX--XFX" }, angle: 45, iterations: 6, startAngle: 90 },
    "Board": { axiom: "F+F+F+F", rules: { F: "FF+F+F+F+FF" }, angle: 90, iterations: 4, startAngle: 90 },
    "Tiles": { axiom: "F+F+F+F", rules: { F: "F+F-F+F+F" }, angle: 90, iterations: 4, startAngle: 90 },
    "Rings": { axiom: "F+F+F+F", rules: { F: "FF+F+F+F+F+F-F" }, angle: 90, iterations: 3, startAngle: 90 },
    "Spiral Square": { axiom: "F+F+F+F", rules: { F: "F+F-F-F+F" }, angle: 90, iterations: 5, startAngle: 90 }
};

const gradientPresets = {
    'Forest': ['#233d30', '#3a5f4f', '#6b8f6d', '#a1b48b', '#d8d9aa', '#ffffcc'],
    'Sunset': ['#2a3b4c', '#534e69', '#915f75', '#d47b73', '#f2b58d', '#fcf6b1'],
    'Ocean': ['#003366', '#005f99', '#008ac4', '#66c2ff', '#b3e0ff', '#ffffff'],
    'Fire': ['#4d0000', '#990000', '#ff3300', '#ff9900', '#ffcc00', '#ffff66'],
    'Nebula': ['#1e164a', '#442b79', '#8a4ea8', '#d678b8', '#f8b4d9', '#ffffff'],
    'Synthwave': ['#2e0c51', '#711c91', '#ea00d9', '#0abdc6', '#00fbac', '#fdfbe0'],
    'Viridis': ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
    'Magma': ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
    'Ice': ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd'],
    'Rainbow': ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
    'Pastel': ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc'],
    'Sunrise': ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0'],
    'Cyber Glow': ['#00ffff', '#00e5ff', '#00ccff', '#00b2ff', '#0099ff', '#007fff'],
    'Deep Space': ['#000000', '#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'],
    'Charcoal': ['#1c1c1c', '#333333', '#4d4d4d', '#666666', '#808080', '#999999'],
    'Autumn Leaves': ['#a44200', '#d58936', '#f2b632', '#f29f05', '#f28705', '#f25c05'],
    'Coral Reef': ['#ff6f61', '#ff9671', '#ffc75f', '#ffd670', '#f9f871', '#d4e09b'],
    'Lavender Field': ['#e6e6fa', '#d8bfd8', '#dda0dd', '#da70d6', '#ba55d3', '#9932cc'],
    'Mint Chocolate': ['#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d', '#52b788', '#40916c'],
    'Ruby Grapefruit': ['#f08080', '#f4978e', '#f8ad9d', '#fbc4ab', '#ffdab9', '#fde4cf'],
    'Monochrome': ['#ffffff', '#d9d9d9', '#b3b3b3', '#8c8c8c', '#666666', '#404040'],
};

function generateLSystemString(axiom: string, rules: RuleSet, iterations: number): string {
    let currentString = axiom;
    const rulesMap = new Map(Object.entries(rules));
    for (let i = 0; i < iterations; i++) {
        let nextString = '';
        for (const char of currentString) {
            nextString += rulesMap.get(char) || char;
        }
        currentString = nextString;
    }
    return currentString;
}

function getSegments(systemString: string, angle: number, startAngle: number): Segment[] {
    const segments: Segment[] = [];
    let current: LSystemState = { x: 0, y: 0, angle: startAngle };
    const stack: LSystemState[] = [];

    for (const cmd of systemString) {
        const rad = current.angle * (Math.PI / 180);
        const lastX = current.x;
        const lastY = current.y;

        switch (cmd) {
            case 'F': case 'G':
                current.x += Math.cos(rad);
                current.y += Math.sin(rad);
                segments.push({ start: { x: lastX, y: lastY }, end: { x: current.x, y: current.y } });
                break;
            case 'f':
                current.x += Math.cos(rad);
                current.y += Math.sin(rad);
                break;
            case '+': current.angle += angle; break;
            case '-': current.angle -= angle; break;
            case '[': stack.push({ ...current }); break;
            case ']': const popped = stack.pop(); if (popped) current = popped; break;
        }
    }
    return segments;
}

function getGradientColor(t: number, colors: string[]): Color {
    const c1 = new Color();
    const c2 = new Color();
    const colorCount = colors.length;
    const p = t * (colorCount - 1);
    const index = Math.floor(p);
    const fraction = p - index;
    const col1 = colors[index];
    const col2 = colors[index + 1 < colorCount ? index + 1 : index];
    c1.set(col1);
    c2.set(col2);
    return c1.lerp(c2, fraction);
}

function generateSVG(segments: Segment[], colors: string[], solidColor: string, useGradient: boolean): string {
    if (segments.length === 0) return '';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    segments.forEach(seg => {
        minX = Math.min(minX, seg.start.x, seg.end.x);
        minY = Math.min(minY, seg.start.y, seg.end.y);
        maxX = Math.max(maxX, seg.start.x, seg.end.x);
        maxY = Math.max(maxY, seg.start.y, seg.end.y);
    });

    const pad = Math.max(maxX - minX, maxY - minY) * 0.05;
    const vbWidth = (maxX - minX) + pad * 2;
    const vbHeight = (maxY - minY) + pad * 2;
    const viewBox = `${minX - pad} ${minY - pad} ${vbWidth} ${vbHeight}`;

    let pathElements = '';
    if (useGradient) {
        const stops = colors.map((c, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${c}" />`).join('');
        pathElements += `<defs><linearGradient id="g" x1="${minX}" y1="${minY}" x2="${maxX}" y2="${minY}">${stops}</linearGradient></defs>`;
        const d = segments.map(seg => `M ${seg.start.x} ${seg.start.y} L ${seg.end.x} ${seg.end.y}`).join(' ');
        pathElements += `<path d="${d}" stroke="url(#g)" stroke-width="${vbWidth / 1000}" fill="none" stroke-linecap="round" />`;
    } else {
        const d = segments.map(seg => `M ${seg.start.x} ${seg.start.y} L ${seg.end.x} ${seg.end.y}`).join(' ');
        pathElements = `<path d="${d}" stroke="${solidColor}" stroke-width="${vbWidth / 1000}" fill="none" stroke-linecap="round" />`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="1000" height="1000" style="background-color: #1a1a1d;">${pathElements}</svg>`;
}

export { presets, gradientPresets, generateLSystemString, getSegments, getGradientColor, RuleSet, generateSVG };