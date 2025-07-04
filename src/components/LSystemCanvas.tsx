import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Float32BufferAttribute, Color } from 'three';
import { useStore } from '../store';
import { generateLSystemString, getSegments, getGradientColor } from '../lsystem';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

function Scene() {
    const state = useStore();
    const { setAngle, setNeedsRecenter } = useStore();
    const { isAngleAnimating, needsRecenter } = state;
    const controlsRef = useRef<CameraControls>(null!);
    const lineRef = useRef<THREE.LineSegments>(null!);
    const { scene } = useThree();

    useFrame((_, delta) => {
        TWEEN.update();
        if (isAngleAnimating) {
            setAngle(prevAngle => (prevAngle + 2.0 * delta) % 360);
        }
    });

    useEffect(() => {
        scene.background = new Color(state.backgroundColor);
    }, [state.backgroundColor, scene]);

    const { vertices, colors, boundingBox } = useMemo(() => {
        const lSystemString = generateLSystemString(state.axiom, state.rules, state.iterations);
        const segments = getSegments(lSystemString, state.angle, state.startAngle);
        if (segments.length === 0) return { vertices: new Float32Array(0), colors: new Float32Array(0), boundingBox: null };

        const vertices: number[] = [];
        const colors: number[] = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const solidColor = new Color(state.solidColor);

        segments.forEach((seg, i) => {
            vertices.push(seg.start.x, seg.start.y, 0, seg.end.x, seg.end.y, 0);
            if (state.useGradient) {
                const c1 = getGradientColor(i / segments.length, state.gradientColors);
                const c2 = getGradientColor((i + 1) / segments.length, state.gradientColors);
                colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
            } else {
                colors.push(solidColor.r, solidColor.g, solidColor.b, solidColor.r, solidColor.g, solidColor.b);
            }
            minX = Math.min(minX, seg.start.x, seg.end.x);
            minY = Math.min(minY, seg.start.y, seg.end.y);
            maxX = Math.max(maxX, seg.start.x, seg.end.x);
            maxY = Math.max(maxY, seg.start.y, seg.end.y);
        });
        
        const center = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0);
        const size = new THREE.Vector3(maxX - minX, maxY - minY, 0);
        return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), boundingBox: new THREE.Box3().setFromCenterAndSize(center, size) };
    }, [state.axiom, state.rules, state.iterations, state.angle, state.startAngle, state.gradientColors, state.useGradient, state.solidColor]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (needsRecenter && controls && boundingBox) {
            controls.fitToBox(boundingBox, true, { paddingTop: 0.1, paddingLeft: 0.1, paddingBottom: 0.1, paddingRight: 0.1 });
            setNeedsRecenter(false);
        }
    }, [vertices, needsRecenter, setNeedsRecenter, boundingBox]);

    useEffect(() => {
        const geometry = lineRef.current.geometry;
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();
    }, [vertices, colors]);

    useEffect(() => {
        const handleExport = () => {
            const renderer = useThree.getState().gl;
            link.href = renderer.domElement.toDataURL('image/png');
            link.click();
        };
        const link = document.createElement('a');
        link.download = 'l-system.png';
        document.addEventListener('export-png', handleExport);
        return () => document.removeEventListener('export-png', handleExport);
    }, []);
    
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;
        
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                controls.mouseButtons.left = 1;
            }
        };
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                controls.mouseButtons.left = 2;
            }
        };

        controls.mouseButtons.left = 2;
        controls.mouseButtons.right = 1;
        controls.mouseButtons.middle = 4;

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    return (
        <>
            <CameraControls ref={controlsRef} dollyToCursor={true} />
            <lineSegments ref={lineRef} key={vertices.length}>
                <bufferGeometry />
                <lineBasicMaterial vertexColors={true} />
            </lineSegments>
        </>
    );
}

export function LSystemCanvas() {
    return (
        <Canvas linear flat orthographic camera={{ position: [0, 0, 20], zoom: 50 }} gl={{ preserveDrawingBuffer: true }}>
            <Scene />
        </Canvas>
    );
}