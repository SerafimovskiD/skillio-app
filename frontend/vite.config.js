import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // сите барања што почнуваат со /api се препраќаат до Spring Boot
        proxy: { '/api': 'http://localhost:8080' },
    },
})