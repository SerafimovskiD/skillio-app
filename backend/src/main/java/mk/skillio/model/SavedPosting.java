package mk.skillio.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "saved_postings", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "posting_id"}))
@Getter
@Setter
@NoArgsConstructor
public class SavedPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "posting_id")
    private JobPosting posting;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private Instant savedAt= Instant.now();
}
