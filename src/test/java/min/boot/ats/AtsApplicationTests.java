package min.boot.ats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootTest
//@ActiveProfiles("h2")또는 @ActiveProfiles("ora") 사용해 별도 지정 가능
class AtsApplicationTests {

    //연결 테스트
    @Autowired
    private DataSource dataSource;
    @Test
    void test() throws Exception {
        try(Connection connection = dataSource.getConnection()){
            System.out.println("URL   = " + connection.getMetaData( ).getURL( ));
            System.out.println("User  = " + connection.getMetaData( ).getUserName( ));
        }
    }

}
