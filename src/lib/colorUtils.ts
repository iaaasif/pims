export function hexToHsl(hex: string): { h: number, s: number, l: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse r, g, b
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hslToVariable(hsl: { h: number, s: number, l: number }): string {
    return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

export function hslToCommaString(hsl: { h: number, s: number, l: number }): string {
    return `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
}

export function getContrastColor(hsl: { h: number, s: number, l: number }): string {
    // If lightness is > 60%, use dark text, otherwise use light text
    return hsl.l > 60 ? '222.2 84% 4.9%' : '210 40% 98%';
}

export function getHoverColor(hsl: { h: number, s: number, l: number }): { h: number, s: number, l: number } {
    // If it's a light color, make it slightly darker for hover
    // If it's a dark color, make it slightly lighter for hover
    const dL = hsl.l > 50 ? -10 : 10;
    return {
        ...hsl,
        l: Math.max(0, Math.min(100, hsl.l + dL))
    };
}

export function getSecondaryColor(hsl: { h: number, s: number, l: number }): { h: number, s: number, l: number } {
    // Secondary is usually a very light, slightly desaturated version
    return {
        h: hsl.h,
        s: Math.min(hsl.s, 40), // Desaturate
        l: 96 // Very light
    };
}

export function getAccentColor(hsl: { h: number, s: number, l: number }): { h: number, s: number, l: number } {
    // Accent is similar to secondary but maybe a bit more saturated
    return {
        h: hsl.h,
        s: Math.min(hsl.s, 60),
        l: 92
    };
}
