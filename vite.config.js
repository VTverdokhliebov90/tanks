import { defineConfig } from 'vite'

export default defineConfig({
    base: '/tanks/',
    plugins: [react()],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false
    }
})