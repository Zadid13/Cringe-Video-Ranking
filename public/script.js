async function searchYouTube() {
    const query = document.getElementById('query').value;
    const response = await fetch(`/youtube/${encodeURIComponent(query)}`);
    const data = await response.json();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
  
    // Check if data has results
    if (data.length === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
      return;
    }
  
    // Add rank and sorted results
    data.forEach((video, index) => {
      const videoElement = document.createElement('div');
      videoElement.className = 'video'; // Apply CSS class here
      videoElement.innerHTML = `
        <h2>Rank #${index + 1}: ${video.title}</h2>
        <p>Channel: ${video.channel}</p>
        <p>Cringe Score: ${video.cringeScore.toFixed(4)}</p>
        <p>Views: ${video.stats.viewCount}</p>
        <p>Likes: ${video.stats.likeCount}</p>
        <p>Comments: ${video.stats.commentCount}</p>
      `;
      resultsDiv.appendChild(videoElement);
    });
  }
  