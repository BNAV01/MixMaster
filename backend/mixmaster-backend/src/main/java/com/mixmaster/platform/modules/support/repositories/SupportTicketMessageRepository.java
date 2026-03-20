package com.mixmaster.platform.modules.support.repositories;

import com.mixmaster.platform.modules.support.models.SupportTicketMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketMessageRepository extends JpaRepository<SupportTicketMessage, String> {

    List<SupportTicketMessage> findAllByTicket_IdOrderByCreatedAtAsc(String ticketId);
}
