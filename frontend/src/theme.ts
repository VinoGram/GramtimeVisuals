import { createSystem, defaultConfig } from '@chakra-ui/react'

const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        elegant: {
          black: { value: '#000000' },
          white: { value: '#ffffff' },
          green: { value: '#22c55e' },
          darkGreen: { value: '#15803d' },
          lightGreen: { value: '#4ade80' },
        }
      },
      fonts: {
        heading: { value: '"Inter", sans-serif' },
        body: { value: '"Manrope", sans-serif' },
      }
    }
  }
})

export default theme