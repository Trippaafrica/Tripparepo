import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#9784F4', // Dark purple
      secondary: '#99FF00', // Neon green
      dark: '#1A1A2E', // Dark background
      light: '#F8F9FA',
      white: '#F2F2F2' // Light text
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.dark' : 'white',
        color: props.colorMode === 'dark' ? 'brand.light' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.secondary',
          color: 'brand.dark',
          _hover: {
            bg: 'brand.secondary',
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
          },
          _active: {
            bg: 'brand.secondary',
            opacity: 0.8,
          },
        },
      },
    },
    Card: {
      baseStyle: (props: { colorMode: string }) => ({
        container: {
          bg: props.colorMode === 'dark' 
            ? 'rgba(26, 26, 46, 0.8)' 
            : 'white',
          backdropFilter: 'blur(10px)',
          border: props.colorMode === 'dark'
            ? '1px solid rgba(157, 78, 221, 0.2)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: props.colorMode === 'dark'
            ? '0 4px 20px rgba(157, 78, 221, 0.15)'
            : '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      }),
    },
    Input: {
      baseStyle: (props: { colorMode: string }) => ({
        field: {
          bg: props.colorMode === 'dark' 
            ? 'rgba(26, 26, 46, 0.6)'
            : 'white',
          border: props.colorMode === 'dark'
            ? '1px solid rgba(157, 78, 221, 0.2)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          _hover: {
            borderColor: 'brand.primary',
          },
          _focus: {
            borderColor: 'brand.secondary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
          },
        },
      }),
    },
  },
});

export default theme; 