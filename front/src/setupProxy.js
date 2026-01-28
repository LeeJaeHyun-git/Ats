const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        // 프록시를 적용할 경로 목록 (컨트롤러에 작성한 모든 API 경로 포함)
        [
            '/api/**',     //'/api'로 시작하는 요청만 백엔드(8080)로 전달
        ],
        createProxyMiddleware({
            target: 'http://localhost:8080', // 스프링 부트 서버 주소
            changeOrigin: true,             // 대상 서버 구성에 따라 호스트 헤더 변경
            cookieDomainRewrite: "localhost", // 백엔드가 쿠키를 Set-Cookie 할 때 도메인 설정을 로컬 환경에 맞게 조정
        })
    );
};