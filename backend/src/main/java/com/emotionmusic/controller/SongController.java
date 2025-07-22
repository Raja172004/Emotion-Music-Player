package com.emotionmusic.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.emotionmusic.dto.SongDTO;
import com.emotionmusic.model.EmotionType;
import com.emotionmusic.service.SongService;

@RestController
@RequestMapping("/songs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SongController {

    @Autowired
    private SongService songService;

    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("Backend connection successful!");
    }

    @GetMapping
    public ResponseEntity<List<SongDTO>> getAllSongs() {
        List<SongDTO> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/emotion/{emotion}")
    public ResponseEntity<List<SongDTO>> getSongsByEmotion(@PathVariable String emotion) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            List<SongDTO> songs = songService.getSongsByEmotion(emotionType);
            return ResponseEntity.ok(songs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/emotion/{emotion}/random")
    public ResponseEntity<List<SongDTO>> getRandomSongsByEmotion(@PathVariable String emotion) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            List<SongDTO> songs = songService.getRandomSongsByEmotion(emotionType);
            return ResponseEntity.ok(songs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongDTO> getSongById(@PathVariable Long id) {
        Optional<SongDTO> song = songService.getSongById(id);
        return song.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDTO> uploadSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam("emotion") String emotion) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            SongDTO uploadedSong = songService.uploadSong(file, title, artist, emotionType);
            return ResponseEntity.status(HttpStatus.CREATED).body(uploadedSong);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadSong(@PathVariable Long id) {
        try {
            Resource resource = songService.loadSongAsResource(id);
            Optional<SongDTO> songOpt = songService.getSongById(id);
            
            if (songOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            SongDTO song = songOpt.get();
            String contentType = song.getMimeType() != null ? song.getMimeType() : "application/octet-stream";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + song.getTitle() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) {
        try {
            Resource resource = songService.loadSongAsResource(id);
            Optional<SongDTO> songOpt = songService.getSongById(id);
            
            if (songOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            SongDTO song = songOpt.get();
            String contentType = song.getMimeType() != null ? song.getMimeType() : "application/octet-stream";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        try {
            songService.deleteSong(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllSongs() {
        try {
            songService.deleteAllSongs();
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<SongDTO>> searchSongs(@RequestParam String q) {
        List<SongDTO> songs = songService.searchSongs(q);
        return ResponseEntity.ok(songs);
    }
}