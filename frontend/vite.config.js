import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        // сите барања што почнуваат со /api се препраќаат до Spring Boot
        proxy: { '/api': 'http://localhost:8080' },
    },
})