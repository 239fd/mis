package by.bsuir.mis.entity;

import by.bsuir.mis.entity.enums.Relationship;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
        name = "user_patients",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uq_user_patient",
                        columnNames = {"user_id", "patient_id"}),
        indexes = {
            @Index(name = "idx_up_user", columnList = "user_id"),
            @Index(name = "idx_up_patient", columnList = "patient_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Relationship relationship = Relationship.SELF;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
