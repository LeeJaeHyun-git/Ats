package min.boot.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import min.boot.ats.domain.Company;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CompanyResponseDto {

    private Long id;
    private String name;
    private List<UserSummaryResponseDto> users;

    public CompanyResponseDto(Company company) {
        this.id = company.getId();
        this.name = company.getName();

        if (company.getUsers() != null) {
            this.users = company.getUsers().stream()
                    .map(user -> new UserSummaryResponseDto(
                            user.getId(),
                            user.getName(),
                            user.getEmail()))
                    .collect(Collectors.toList());
        }
    }

    @Getter
    @AllArgsConstructor
    public static class UserSummaryResponseDto {
        private Long id;
        private String name;
        private String email;
    }
}