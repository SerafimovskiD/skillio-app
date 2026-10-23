package mk.skillio.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "posting_skills",uniqueConstraints = @UniqueConstraint(columnNames = {"posting_id","skill_id"}))
@Getter
@Setter
@NoArgsConstructor
public class PostingSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "posting_id")
    private JobPosting posting;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(nullable = false)
    private boolean required=true;

}
