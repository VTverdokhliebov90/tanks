import { defineConfig } from 'vite'

export default defineConfig({
    base: '/tanks/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false
    }
})