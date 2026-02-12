package com.irctc.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.irctc.model.Train;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final File trainFile = new File("data/trains.json");
    private final List<Train> trains = new ArrayList<>();

    public TrainService() {
        loadTrains();
    }

    private void loadTrains() {
        try {
            if (!trainFile.exists()) {
                trainFile.getParentFile().mkdirs();
                mapper.writeValue(trainFile, List.of());
            }

            List<Train> data =
                    mapper.readValue(trainFile, new TypeReference<>() {});
            trains.addAll(data);

        } catch (Exception e) {
            throw new RuntimeException("Failed to load trains", e);
        }
    }

    private void saveTrains() {
        try {
            mapper.writerWithDefaultPrettyPrinter()
                  .writeValue(trainFile, trains);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save trains", e);
        }
    }

    public List<Train> getAllTrains() {
        return trains;
    }

    public Train getTrainById(String trainId) {
        return trains.stream()
                .filter(t -> t.getTrainId().equals(trainId))
                .findFirst()
                .orElse(null);
    }

    public List<Train> searchTrains(String source, String destination) {
        return trains.stream()
                .filter(t ->
                        t.getSource().equalsIgnoreCase(source) &&
                        t.getDestination().equalsIgnoreCase(destination)
                )
                .collect(Collectors.toList());
    }

    // ─── SEAT MANAGEMENT ─────────────────────

    public boolean reserveSeat(String trainId) {
        Train train = getTrainById(trainId);
        if (train == null || train.getAvailableSeats() <= 0) return false;

        train.setAvailableSeats(train.getAvailableSeats() - 1);
        saveTrains();
        return true;
    }

    public void releaseSeat(String trainId) {
        Train train = getTrainById(trainId);
        if (train != null) {
            train.setAvailableSeats(train.getAvailableSeats() + 1);
            saveTrains();
        }
    }
}
