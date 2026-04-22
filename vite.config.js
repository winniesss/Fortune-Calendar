import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
        base: '/Fortune-Calendar/',
        build: {
    outDir: 'dist',
          assetsDir: 'assets',
      },
})
