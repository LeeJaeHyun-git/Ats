package min.boot.ats.control;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askToFlask(@RequestBody Map<String, String> request) {
        // Flask 서버 주소 (Python 서버가 5000포트에서 실행 중이어야 함)
        String flaskUrl = "http://localhost:5000/api/chatbot/ask";

        try {
            // Flask 서버로 요청 중계
            ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, request, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("answer", "AI 서버와 연결할 수 없습니다. (Flask 서버 실행 확인 필요)"));
        }
    }
}
