import { create } from 'zustand';
import { presets, gradientPresets, RuleSet } from './lsystem';

interface LSystemState {
    preset: string;
    axiom: string;
    rules: RuleSet;
    angle: number;
    startAngle: number;
    iterations: number;
    useGradient: boolean;
    solidColor: string;
    gradientPreset: string;
    gradientColors: string[];
    backgroundColor: string;
    isAngleAnimating: boolean;
    needsRecenter: boolean;
    presets: { [key: string]: { axiom: string; rules: RuleSet; angle: number; startAngle?: number; iterations: number; } };
    gradientPresets: { [key: string]: string[] };

    setAxiom: (axiom: string) => void;
    setAngle: (value: number | ((current: number) => number)) => void;
    setIterations: (value: number | ((current: number) => number)) => void;
    addRule: (key: string) => void;
    removeRule: (key: string) => void;
    updateRuleValue: (key: string, value: string) => void;
    setUseGradient: (use: boolean) => void;
    setSolidColor: (color: string) => void;
    updateGradientColor: (index: number, color: string) => void;
    setGradientPreset: (name: string) => void;
    setBackgroundColor: (color: string) => void;
    toggleAngleAnimation: () => void;
    loadPreset: (name: string) => void;
    setNeedsRecenter: (needsRecenter: boolean) => void;
    hydrateFromUrl: (data: Partial<LSystemState>) => void;
}

const initialPreset = presets['Fractal Tree'];

export const useStore = create<LSystemState>((set, get) => ({
    preset: 'Fractal Tree',
    axiom: initialPreset.axiom,
    rules: { ...initialPreset.rules },
    angle: initialPreset.angle,
    startAngle: initialPreset.startAngle || 90,
    iterations: initialPreset.iterations,
    useGradient: true,
    solidColor: '#61afef',
    gradientPreset: 'Forest',
    gradientColors: gradientPresets['Forest'],
    backgroundColor: '#1a1a1d',
    isAngleAnimating: false,
    needsRecenter: true,
    presets: presets,
    gradientPresets: gradientPresets,
    
    setAxiom: (axiom) => set({ axiom, needsRecenter: true }),
    setAngle: (value) => set(state => ({ angle: typeof value === 'function' ? value(state.angle) : value })),
    setIterations: (value) => set(state => {
        const newValue = typeof value === 'function' ? value(state.iterations) : value;
        const clampedValue = Math.max(1, Math.min(12, newValue));
        return { iterations: clampedValue, needsRecenter: true };
    }),
    
    addRule: (key) => set(state => ({ rules: { ...state.rules, [key]: '' }})),
    removeRule: (key) => set(state => {
        const newRules = { ...state.rules };
        delete newRules[key];
        return { rules: newRules, needsRecenter: true };
    }),
    updateRuleValue: (key, value) => set(state => ({
        rules: { ...state.rules, [key]: value },
        needsRecenter: true 
    })),

    setUseGradient: (use) => set({ useGradient: use }),
    setSolidColor: (color) => set({ solidColor: color }),
    updateGradientColor: (index, color) => set(state => {
        const newColors = [...state.gradientColors];
        newColors[index] = color;
        return { gradientColors: newColors };
    }),

    setGradientPreset: (name) => set({
        gradientPreset: name,
        gradientColors: gradientPresets[name] || [],
        useGradient: true,
    }),

    setBackgroundColor: (color) => set({ backgroundColor: color }),
    toggleAngleAnimation: () => set(state => ({ isAngleAnimating: !state.isAngleAnimating })),

    loadPreset: (name) => {
        const preset = get().presets[name];
        if (preset) {
            set({
                preset: name,
                axiom: preset.axiom,
                rules: { ...preset.rules },
                angle: preset.angle,
                startAngle: preset.startAngle || 90,
                iterations: preset.iterations,
                needsRecenter: true,
            });
        }
    },
    
    setNeedsRecenter: (needsRecenter) => set({ needsRecenter }),
    hydrateFromUrl: (data) => set({ ...data, startAngle: data.startAngle || 90, needsRecenter: true }),
}));