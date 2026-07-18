import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    // চাঙ্ক সাইজের ওয়ার্নিং লিমিট বাড়িয়ে ২০০০ KB করা হলো
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // এই ফাংশনটি বড় নোড মডিউলগুলোকে আলাদা আলাদা ফাইলে ভাগ করে ফেলবে
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
})