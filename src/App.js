import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = 'c236ba9303002762e219501642e64468';
const API_URL = 'http://ws.audioscrobbler.com/2.0/';

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query === '') return;

    try {
      const response = await axios.get(API_URL, {
        params: {
          method: 'track.search',
          track: query,
          api_key: API_KEY,
          format: 'json',
          limit: 10,
        },
      });

      const tracks = response.data.results.trackmatches.track;
      const songsWithAlbumInfo = await Promise.all(tracks.map(fetchTrackDetails));

      setSongs(songsWithAlbumInfo);
    } catch (error) {
      console.error('Error fetching data from Last.fm API', error);
    }
  };

  // Function to fetch track details (including album info)
  const fetchTrackDetails = async (track) => {
    try {
      const trackInfoResponse = await axios.get(API_URL, {
        params: {
          method: 'track.getInfo',
          artist: track.artist,
          track: track.name,
          api_key: API_KEY,
          format: 'json',
        },
      });

      const trackInfo = trackInfoResponse.data.track;
      return {
        ...track,
        albumImage: trackInfo.album ? trackInfo.album.image[2]['#text'] : 'https://via.placeholder.com/150',
      };
    } catch (error) {
      console.error('Error fetching track info', error);
      return {
        ...track,
        albumImage: 'https://via.placeholder.com/150',
      };
    }
  };

  return (
    <div className="App">
      <h1>🎵 Song Search 🎵</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a song or artist name..."
          className="search-box"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="song-list">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={index} className="song-card">
              <img
                src={song.albumImage || 'https://via.placeholder.com/150'}
                alt={song.name}
                className="album-cover"
              />
              <div className="song-info">
                <p className="song-title">{song.name}</p>
                <p className="song-artist">by {song.artist}</p>
                <a href={song.url} target="_blank" rel="noopener noreferrer" className="listen-link">
                  Listen on Last.fm
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No songs found</p>
        )}
      </div>
    </div>
  );
}

export default App;
