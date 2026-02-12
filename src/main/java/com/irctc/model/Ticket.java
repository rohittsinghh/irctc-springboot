package com.irctc.model;

public class Ticket {

    private String ticketId;
    private String userId;
    private String source;
    private String destination;
    private String journeyDate;
    private Train train;

    public Ticket() {
        // for Jackson
    }

    public Ticket(String ticketId,
                  String userId,
                  String source,
                  String destination,
                  String journeyDate,
                  Train train) {

        this.ticketId = ticketId;
        this.userId = userId;
        this.source = source;
        this.destination = destination;
        this.journeyDate = journeyDate;
        this.train = train;
    }

    // ─── Getters & Setters ─────────────────────────────

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(String journeyDate) {
        this.journeyDate = journeyDate;
    }

    public Train getTrain() {
        return train;
    }

    public void setTrain(Train train) {
        this.train = train;
    }
}
