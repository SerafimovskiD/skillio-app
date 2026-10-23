package mk.skillio.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mk.skillio.enums.ApplicationStatus;

import java.time.Instant;

@Entity
@Table(name = "applications",uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","posting_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "posting_id")
    private JobPosting posting;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status=ApplicationStatus.SENT;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "created_at", nullable = false,updatable = false)
    private Instant createdAt=Instant.now();


}
