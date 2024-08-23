const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Your YouTube API key from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function calculateCringeScore(videoStats) {
  // Default values to prevent issues if any key is missing
  const { likeCount = '0', dislikeCount = '0', commentCount = '0' } = videoStats;

  // Convert to numbers with fallback to 0
  const likes = parseInt(likeCount, 10) || 0;
  const dislikes = parseInt(dislikeCount, 10) || 0;
  const comments = parseInt(commentCount, 10) || 0;

  // Avoid division by zero
  const totalInteractions = likes + dislikes;
  if (totalInteractions === 0) return 0;

  const dislikeRatio = dislikes / totalInteractions;
  const engagement = comments / totalInteractions;

  return (dislikeRatio * 0.7 + engagement * 0.3);
}

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/youtube/:query', async (req, res) => {
  const query = encodeURIComponent(req.params.query); // Encode query to handle special characters

  try {
    // Fetch the list of videos based on the search term
    const searchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${YOUTUBE_API_KEY}`
    );
    const videos = searchResponse.data.items;

    if (!videos || videos.length === 0) {
      return res.status(404).send('No videos found');
    }

    // Extract video IDs from the search result
    const videoIds = videos.map(video => video.id.videoId).join(',');

    // Fetch detailed stats for the videos
    const statsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videoStats = statsResponse.data.items;

    if (!videoStats || videoStats.length === 0) {
      return res.status(404).send('No video stats found');
    }

    // Calculate the cringe score for each video
    const videosWithCringeScore = videoStats.map(video => {
      const cringeScore = calculateCringeScore(video.statistics);
      return {
        title: video.snippet.title, // Ensure title is included
        channel: video.snippet.channelTitle,
        cringeScore: cringeScore,
        stats: video.statistics
      };
    });

    // Sort videos by cringe score in descending order
    videosWithCringeScore.sort((a, b) => b.cringeScore - a.cringeScore);

    // Return the videos with their cringe scores
    res.json(videosWithCringeScore);
  } catch (error) {
    console.error('Error fetching video stats:', error.message);
    res.status(500).send('Error fetching video stats');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
