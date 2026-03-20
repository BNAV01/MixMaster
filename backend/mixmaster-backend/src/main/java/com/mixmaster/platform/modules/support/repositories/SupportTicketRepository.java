package com.mixmaster.platform.modules.support.repositories;

import com.mixmaster.platform.modules.support.models.SupportTicket;
import com.mixmaster.platform.modules.support.models.SupportTicketPriority;
import com.mixmaster.platform.modules.support.models.SupportTicketStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {

    List<SupportTicket> findAllByOrderByLastMessageAtDesc();

    List<SupportTicket> findAllByTenantIdOrderByLastMessageAtDesc(String tenantId);

    Optional<SupportTicket> findByIdAndTenantId(String ticketId, String tenantId);

    long countByStatusIn(Collection<SupportTicketStatus> statuses);

    long countByStatusInAndPriorityIn(Collection<SupportTicketStatus> statuses, Collection<SupportTicketPriority> priorities);

    long countByTenantIdAndStatusIn(String tenantId, Collection<SupportTicketStatus> statuses);

    long countByTenantIdAndStatusInAndPriorityIn(String tenantId, Collection<SupportTicketStatus> statuses, Collection<SupportTicketPriority> priorities);
}
