
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  plugins: [react()],
  // [수정] tsconfig.json과 동일하게 Vite가 경로 별칭을 인식하도록 설정을 추가합니다.
  // 이것이 빌드 오류의 마지막 원인이었습니다.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
