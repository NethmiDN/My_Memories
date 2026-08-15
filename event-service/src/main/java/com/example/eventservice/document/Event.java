package com.example.eventservice.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "events")
public class Event {

    @Id
    private String id;
    private Long userId;
    private String title;
    private String description;
    private LocalDate eventDate;
    private String location;
    private List<String> imageUrls = new ArrayList<>();

    public Event() {
    }

    public Event(String id, Long userId, String title, String description, LocalDate eventDate, String location, List<String> imageUrls) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        if (imageUrls != null) {
            this.imageUrls = imageUrls;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public void addImageUrl(String url) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(url);
    }
}
