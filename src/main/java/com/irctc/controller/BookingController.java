package com.irctc.controller;

import com.irctc.model.Ticket;
import com.irctc.model.Train;
import com.irctc.model.User;
import com.irctc.service.TrainService;
import com.irctc.service.UserBookingService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final UserBookingService userService;
    private final TrainService trainService;

    public BookingController(UserBookingService userService,
                             TrainService trainService) {
        this.userService = userService;
        this.trainService = trainService;
    }

    @PostMapping
    public Object bookTicket(@RequestBody BookingRequest req) {

        if (req.userId == null || req.trainId == null) {
            return Map.of("error", "userId_and_trainId_required");
        }

        User user = userService.getUserById(req.userId);
        if (user == null) return Map.of("error", "invalid_user");

        Train train = trainService.getTrainById(req.trainId);
        if (train == null) return Map.of("error", "invalid_train");

        boolean reserved = trainService.reserveSeat(req.trainId);
        if (!reserved) return Map.of("error", "no_seats_available");

        Ticket ticket = new Ticket(
                UUID.randomUUID().toString(),
                user.getUserId(),
                train.getSource(),
                train.getDestination(),
                LocalDate.now().toString(),
                train
        );

        userService.bookTicket(user, ticket);
        return ticket;
    }

    @GetMapping("/{userId}")
    public Object getBookings(@PathVariable String userId) {
        User user = userService.getUserById(userId);

        if (user == null) {
            return Map.of("error", "invalid_user");
        }

        return Map.of("tickets", user.getTicketsBooked());
    }


@DeleteMapping("/{ticketId}")
public Map<String, String> cancelTicket(@PathVariable String ticketId,
                                        @RequestParam(required = false) String userId) {

    if (userId == null) {
        return Map.of("error", "userId_required");
    }

    String ownerId = userService.findTicketOwnerId(ticketId);
    if (ownerId == null) {
        return Map.of("error", "ticket_not_found");
    }

    if (!ownerId.equals(userId)) {
        return Map.of("error", "forbidden");
    }

    Ticket removed = userService.removeTicketIfOwner(ticketId, userId);

    if (removed != null) {
        trainService.releaseSeat(removed.getTrain().getTrainId());
        return Map.of("status", "cancelled");
    }

    return Map.of("error", "ticket_not_found");
}

    // ─── DTO ───────────────────────────────
    static class BookingRequest {
        public String userId;
        public String trainId;
    }
}
