package com.emotionmusic.service;

import com.emotionmusic.dto.SongDTO;
import com.emotionmusic.model.EmotionType;
import com.emotionmusic.model.Playlist;
import com.emotionmusic.model.Song;
import com.emotionmusic.repository.PlaylistRepository;
import com.emotionmusic.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private SongRepository songRepository;

    public List<SongDTO> getPlaylistByEmotion(EmotionType emotion) {
        Optional<Playlist> playlistOpt = playlistRepository.findByEmotion(emotion);
        
        if (playlistOpt.isPresent()) {
            return playlistOpt.get().getSongs().stream()
                    .map(this::convertSongToDTO)
                    .collect(Collectors.toList());
        }
        
        // If no playlist exists, create one with all songs of that emotion
        return createPlaylistForEmotion(emotion);
    }

    public List<SongDTO> createPlaylistForEmotion(EmotionType emotion) {
        List<Song> songs = songRepository.findByEmotionCategory(emotion);
        
        Playlist playlist = new Playlist(emotion);
        playlist.setSongs(songs);
        playlistRepository.save(playlist);
        
        return songs.stream()
                .map(this::convertSongToDTO)
                .collect(Collectors.toList());
    }

    public void addSongToPlaylist(EmotionType emotion, Long songId) {
        Optional<Song> songOpt = songRepository.findById(songId);
        if (songOpt.isEmpty()) {
            throw new IllegalArgumentException("Song not found");
        }

        Song song = songOpt.get();
        Optional<Playlist> playlistOpt = playlistRepository.findByEmotion(emotion);
        
        Playlist playlist;
        if (playlistOpt.isPresent()) {
            playlist = playlistOpt.get();
        } else {
            playlist = new Playlist(emotion);
        }
        
        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
            playlistRepository.save(playlist);
        }
    }

    public void removeSongFromPlaylist(EmotionType emotion, Long songId) {
        Optional<Playlist> playlistOpt = playlistRepository.findByEmotion(emotion);
        if (playlistOpt.isEmpty()) {
            throw new IllegalArgumentException("Playlist not found");
        }

        Playlist playlist = playlistOpt.get();
        playlist.getSongs().removeIf(song -> song.getId().equals(songId));
        playlistRepository.save(playlist);
    }

    private SongDTO convertSongToDTO(Song song) {
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