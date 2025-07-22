package com.emotionmusic.service;

import com.emotionmusic.dto.SongDTO;
import com.emotionmusic.model.EmotionType;
import com.emotionmusic.model.Song;
import com.emotionmusic.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<SongDTO> getAllSongs() {
        return songRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SongDTO> getSongsByEmotion(EmotionType emotion) {
        return songRepository.findByEmotionCategory(emotion)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SongDTO> getRandomSongsByEmotion(EmotionType emotion) {
        return songRepository.findRandomSongsByEmotion(emotion)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<SongDTO> getSongById(Long id) {
        return songRepository.findById(id)
                .map(this::convertToDTO);
    }

    public SongDTO uploadSong(MultipartFile file, String title, String artist, EmotionType emotionCategory) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("audio/mpeg") && !contentType.equals("audio/wav"))) {
            throw new IllegalArgumentException("Only MP3 and WAV files are supported");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create song entity
        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setFilePath(filePath.toString());
        song.setEmotionCategory(emotionCategory);
        song.setFileSize(file.getSize());
        song.setMimeType(contentType);

        // Save to database
        Song savedSong = songRepository.save(song);
        return convertToDTO(savedSong);
    }

    public Resource loadSongAsResource(Long songId) throws IOException {
        Optional<Song> songOpt = songRepository.findById(songId);
        if (songOpt.isEmpty()) {
            throw new IllegalArgumentException("Song not found");
        }

        Song song = songOpt.get();
        Path filePath = Paths.get(song.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Could not read file: " + song.getFilePath());
        }
    }

    public void deleteSong(Long id) throws IOException {
        Optional<Song> songOpt = songRepository.findById(id);
        if (songOpt.isEmpty()) {
            throw new IllegalArgumentException("Song not found");
        }

        Song song = songOpt.get();
        
        // Delete file from filesystem
        Path filePath = Paths.get(song.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Delete from database
        songRepository.delete(song);
    }

    public void deleteAllSongs() throws IOException {
        List<Song> allSongs = songRepository.findAll();
        System.out.println("Found " + allSongs.size() + " songs to delete");
        
        // Delete all files from filesystem
        for (Song song : allSongs) {
            Path filePath = Paths.get(song.getFilePath());
            if (Files.exists(filePath)) {
                try {
                    Files.delete(filePath);
                    System.out.println("Deleted file: " + song.getFilePath());
                } catch (IOException e) {
                    // Log the error but continue with other files
                    System.err.println("Failed to delete file: " + song.getFilePath() + " - " + e.getMessage());
                }
            } else {
                System.out.println("File not found: " + song.getFilePath());
            }
        }
        
        // Clear playlist_songs junction table first to avoid foreign key constraint issues
        // This is handled automatically by the foreign key CASCADE, but we'll be explicit
        System.out.println("Deleting all songs from database...");
        songRepository.deleteAll();
        System.out.println("All songs deleted from database");
    }

    public List<SongDTO> searchSongs(String query) {
        List<Song> titleResults = songRepository.findByTitleContainingIgnoreCase(query);
        List<Song> artistResults = songRepository.findByArtistContainingIgnoreCase(query);
        
        // Combine and deduplicate results
        titleResults.addAll(artistResults);
        return titleResults.stream()
                .distinct()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SongDTO convertToDTO(Song song) {
        SongDTO dto = new SongDTO();
        dto.setId(song.getId());
        dto.setTitle(song.getTitle());
        dto.setArtist(song.getArtist());
        dto.setEmotionCategory(song.getEmotionCategory());
        dto.setFilePath(song.getFilePath());
        dto.setFileSize(song.getFileSize());
        dto.setDuration(song.getDuration());
        dto.setMimeType(song.getMimeType());
        return dto;
    }
}