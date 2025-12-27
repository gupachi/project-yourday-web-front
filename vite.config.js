import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 포트 설정 제거 - Vite가 자동으로 사용 가능한 포트 찾음

    // 프록시 설정 - CORS 문제 해결
    // '/api'로 시작하는 모든 요청을 배포된 백엔드로 전달
    proxy: {
      '/api': {
        target: 'https://yourday.rootbly.com',  // 배포된 백엔드 서버 주소
        changeOrigin: true,  // Origin 헤더를 타겟 URL로 변경
        secure: false,  // https 검증 비활성화
        // rewrite: (path) => path.replace(/^\/api/, ''),  // '/api' 제거가 필요하면 주석 해제
      }
    }
  }
})
