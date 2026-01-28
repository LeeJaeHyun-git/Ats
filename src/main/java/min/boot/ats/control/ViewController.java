package min.boot.ats.control;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    /**
     * [SPA 라우팅 처리]
     * 정규식 수정: "api"로 시작하지 않는 경로만 index.html로 보냄
     * 이렇게 해야 API 요청이 없는 경우 404가 뜨지, 405(Method Not Allowed)가 뜨지 않습니다.
     */
    @GetMapping(value = {
            "/",
            "/{path:^(?!api).*}",       // api로 시작하지 않는 1단계 경로
            "/**/{path:^(?!api).*}"     // api로 시작하지 않는 중첩 경로
    })
    public String forward() {
        return "index";
    }
}