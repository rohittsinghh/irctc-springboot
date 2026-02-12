package com.irctc.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.irctc.model.Ticket;
import com.irctc.model.User;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class UserBookingService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final File userFile = new File("data/users.json");
    private final List<User> users = new ArrayList<>();

    public UserBookingService() {
        loadUsers();
    }

    private void loadUsers() {
        try {
            if (!userFile.exists()) {
                userFile.getParentFile().mkdirs();
                mapper.writeValue(userFile, List.of());
            }

            List<User> data =
                    mapper.readValue(userFile, new TypeReference<>() {});
            users.addAll(data);

        } catch (Exception e) {
            throw new RuntimeException("Failed to load users.json", e);
        }
    }

    private void saveUsers() {
        try {
            mapper.writerWithDefaultPrettyPrinter()
                  .writeValue(userFile, users);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save users.json", e);
        }
    }

    // ─── USER OPS ──────────────────────────────

    public boolean signUp(User user) {
        boolean exists = users.stream()
                .anyMatch(u -> u.getName().equals(user.getName()));

        if (exists) return false;

        user.setUserId(UUID.randomUUID().toString());
        user.setTicketsBooked(new ArrayList<>());

        users.add(user);
        saveUsers();
        return true;
    }

    public boolean loginUser(String name, String password) {
        return users.stream()
                .anyMatch(u ->
                        u.getName().equals(name) &&
                        u.getPassword().equals(password)
                );
    }

    public User getUserById(String userId) {
        return users.stream()
                .filter(u -> u.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    public List<User> getAllUsers() {
        return users;
    }

    // ─── BOOKING OPS ───────────────────────────

    public void bookTicket(User user, Ticket ticket) {
        user.getTicketsBooked().add(ticket);
        saveUsers();
    }

    public boolean cancelTicketById(String ticketId) {
        for (User user : users) {
            boolean removed =
                    user.getTicketsBooked()
                        .removeIf(t -> t.getTicketId().equals(ticketId));

            if (removed) {
                saveUsers();
                return true;
            }
        }
        return false;
    }
    public Ticket removeTicket(String ticketId) {
        for (User user : users) {
            for (Ticket t : user.getTicketsBooked()) {
                if (t.getTicketId().equals(ticketId)) {
                    user.getTicketsBooked().remove(t);
                    saveUsers();
                    return t;
                }
            }
        }
        return null;
    }

}
