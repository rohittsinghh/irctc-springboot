package com.irctc.controller;

import com.irctc.model.Train;
import com.irctc.service.TrainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainService trainService;

    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }

    @GetMapping
    public Map<String, List<Train>> getAllTrains() {
        return Map.of("trains", trainService.getAllTrains());
    }

    @GetMapping("/{id}")
    public Train getTrainById(@PathVariable String id) {
        return trainService.getTrainById(id);
    }

    @GetMapping("/search")
    public Map<String, List<Train>> search(
            @RequestParam String source,
            @RequestParam String destination) {

        return Map.of(
                "trains",
                trainService.searchTrains(source, destination)
        );
    }
}
