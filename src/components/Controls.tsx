import { Box, Flex, Select, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Button, Text, Input, Switch, Stack, Menu, MenuButton, MenuList, MenuItem, useToast } from '@chakra-ui/react';
import { useStore } from '../store';
import { RuleEditor } from './RuleEditor';
import { generateLSystemString, getSegments, generateSVG } from '../lsystem';
import pako from 'pako';

export function Controls() {
    const state = useStore();
    const toast = useToast();

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetName = e.target.value;
        state.loadPreset(presetName);
    };
    
    const handleIterationChange = (newValue: number) => {
        if (newValue > 7) {
            toast({
                title: "High Iteration Count",
                description: "Higher values require more computation and could be slow.",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top",
            });
        }
        state.setIterations(newValue);
    };

    const handleExportSVG = () => {
        const lSystemString = generateLSystemString(state.axiom, state.rules, state.iterations);
        const segments = getSegments(lSystemString, state.angle, state.startAngle);
        const svgString = generateSVG(segments, state.gradientColors, state.solidColor, state.useGradient);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'l-system.svg';
        a.click();
        URL.revokeObjectURL(url);
    };
    
    const handleCopyLink = () => {
        const dataToShare = {
            axiom: state.axiom, rules: state.rules, angle: state.angle,
            iterations: state.iterations, useGradient: state.useGradient,
            solidColor: state.solidColor, gradientColors: state.gradientColors,
            backgroundColor: state.backgroundColor, startAngle: state.startAngle
        };
        const jsonString = JSON.stringify(dataToShare);
        const compressed = pako.deflate(jsonString);
        const base64 = btoa(String.fromCharCode.apply(null, compressed as unknown as number[]));
        const url = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(base64)}`;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!", description: "A shareable link has been copied to your clipboard.",
            status: "success", duration: 3000, isClosable: true, position: "top",
        });
    };

    return (
        <Box p={2} bg="#222226" borderBottom="1px solid #3a3d4b">
            <Flex wrap="wrap" align="center" gap={4}>
                <Select size="sm" w="180px" value={state.preset} onChange={handlePresetChange}>
                    {Object.keys(state.presets).map(p => <option key={p} value={p}>{p}</option>)}
                </Select>

                <Flex align="center" gap={2}> <Text fontSize="sm" whiteSpace="nowrap">Axiom:</Text> <Input size="sm" w="120px" value={state.axiom} onChange={(e) => state.setAxiom(e.target.value)} /> </Flex>
                <RuleEditor />

                <Stack spacing={1}>
                    <Flex align="center" gap={2}>
                        <Text fontSize="sm" w="45px">Angle:</Text>
                        <Button size="xs" onClick={() => state.setAngle(a => parseFloat((a - 0.1).toFixed(2)))}>-</Button>
                        <Text fontSize="sm" w="40px" textAlign="center">{state.angle.toFixed(1)}</Text>
                        <Button size="xs" onClick={() => state.setAngle(a => parseFloat((a + 0.1).toFixed(2)))}>+</Button>
                        <Button size="xs" colorScheme={state.isAngleAnimating ? 'red' : 'green'} onClick={state.toggleAngleAnimation}>{state.isAngleAnimating ? 'Pause' : 'Play'}</Button>
                    </Flex>
                    <Slider aria-label='angle-slider' value={state.angle} min={0} max={360} step={0.1} onChange={(v) => state.setAngle(v)}>
                        <SliderTrack><SliderFilledTrack /></SliderTrack>
                        <SliderThumb />
                    </Slider>
                </Stack>
                
                <Flex align="center" gap={2}>
                    <Text fontSize="sm">Iterations:</Text>
                    <Button size="xs" onClick={() => handleIterationChange(state.iterations - 1)}>-</Button>
                    <Text fontSize="sm" w="20px" textAlign="center">{state.iterations}</Text>
                    <Button size="xs" onClick={() => handleIterationChange(state.iterations + 1)}>+</Button>
                </Flex>

                <Flex align="center" gap={2}> <Text fontSize="sm">BG:</Text> <Input type="color" size="sm" w="28px" h="28px" p={0} value={state.backgroundColor} onChange={(e) => state.setBackgroundColor(e.target.value)} /> </Flex>
                
                <Flex align="center" gap={2}> <Text fontSize="sm">Use Gradient</Text> <Switch isChecked={state.useGradient} onChange={(e) => state.setUseGradient(e.target.checked)} /> </Flex>

                {state.useGradient ? (
                     <Flex align="center" gap={2}>
                        <Select size="sm" w="120px" value={state.gradientPreset} onChange={(e) => state.setGradientPreset(e.target.value)}> {Object.keys(state.gradientPresets).map(g => <option key={g} value={g}>{g}</option>)} </Select>
                        {state.gradientColors.map((color, index) => ( <Input key={index} type="color" size="sm" w="28px" h="28px" p={0} cursor="pointer" value={color} onChange={(e) => state.updateGradientColor(index, e.target.value)} /> ))}
                     </Flex>
                ) : (
                    <Flex align="center" gap={2}> <Text fontSize="sm">Color:</Text> <Input type="color" size="sm" w="28px" h="28px" p={0} value={state.solidColor} onChange={(e) => state.setSolidColor(e.target.value)} /> </Flex>
                )}
                
                <Button size="sm" onClick={() => state.setNeedsRecenter(true)}>Recenter</Button>

                <Menu>
                    <MenuButton as={Button} size="sm">Export</MenuButton>
                    <MenuList bg="#222226" borderColor="#3a3d4b">
                        <MenuItem bg="transparent" _hover={{ bg: "#3a3d4b" }} onClick={() => document.dispatchEvent(new Event('export-png'))}>PNG</MenuItem>
                        <MenuItem bg="transparent" _hover={{ bg: "#3a3d4b" }} onClick={handleExportSVG}>SVG</MenuItem>
                        <MenuItem bg="transparent" _hover={{ bg: "#3a3d4b" }} onClick={handleCopyLink}>Copy Link</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Box>
    );
}