import { ChakraProvider, extendTheme, Box, Flex } from '@chakra-ui/react';
import { Controls } from './components/Controls';
import { LSystemCanvas } from './components/LSystemCanvas';
import { useStore } from './store';
import { useEffect } from 'react';
import pako from 'pako';

const theme = extendTheme({
  styles: { global: { body: { bg: '#1a1a1d', color: '#c5c8c6' } } },
  config: { initialColorMode: 'dark', useSystemColorMode: false }
});

function AppContent() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const binaryString = atob(decodeURIComponent(data));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decompressed = pako.inflate(bytes, { to: 'string' });
        const parsed = JSON.parse(decompressed);
        useStore.getState().hydrateFromUrl(parsed);
      } catch (e) {
        console.error("Failed to load state from URL", e);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  return (
    <Flex direction="column" h="100vh" w="100vw" bg={useStore(s => s.backgroundColor)}>
      <Controls />
      <Box flex="1" position="relative">
        <LSystemCanvas />
      </Box>
    </Flex>
  );
}

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppContent />
    </ChakraProvider>
  );
}