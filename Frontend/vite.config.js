import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        open: true,
    },
    preview: {
        host: '0.0.0.0',
        allowedHosts: [
            'fypfrontened-production.up.railway.app',
            'localhost',
            '127.0.0.1',
        ],
    },
});
