package com.irctc.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class User {

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("password")
    private String password;

    private List<Ticket> ticketsBooked;

    public User() {}

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // DO NOT ignore during binding
    public String getPassword() {
        return password;
    }

    // We control exposure at controller level
    public void setPassword(String password) {
        this.password = password;
    }

    public List<Ticket> getTicketsBooked() {
        if (ticketsBooked == null) {
            ticketsBooked = new ArrayList<>();
        }
        return ticketsBooked;
    }

    public void setTicketsBooked(List<Ticket> ticketsBooked) {
        this.ticketsBooked = ticketsBooked;
    }
}
