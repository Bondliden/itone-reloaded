import express from 'express';

export const karaokeRoutes = express.Router();

// Mock song database
const songs = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    duration: 355,
    genre: 'Rock',
    difficulty: 'Hard',
    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: 233,
    genre: 'Pop',
    difficulty: 'Medium',
    videoUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8'
  },
  {
    id: '3',
    title: 'Imagine',
    artist: 'John Lennon',
    duration: 183,
    genre: 'Classic',
    difficulty: 'Easy',
    videoUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8'
  },
  {
    id: '4',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    duration: 294,
    genre: 'Pop',
    difficulty: 'Medium',
    videoUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y'
  }
];

let queue: Array<{
  id: string;
  songId: string;
  userId: string;
  userName: string;
  timestamp: number;
}> = [];

// Get all songs
karaokeRoutes.get('/songs', (req, res) => {
  const { search, genre } = req.query;
  let filteredSongs = songs;

  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredSongs = filteredSongs.filter(song =>
      song.title.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm)
    );
  }

  if (genre) {
    filteredSongs = filteredSongs.filter(song =>
      song.genre.toLowerCase() === (genre as string).toLowerCase()
    );
  }

  res.json(filteredSongs);
});

// Get song by ID
karaokeRoutes.get('/songs/:id', (req, res) => {
  const song = songs.find(s => s.id === req.params.id);
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  res.json(song);
});

// Add song to queue
karaokeRoutes.post('/queue', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { songId } = req.body;
  const song = songs.find(s => s.id === songId);
  
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  const queueItem = {
    id: Date.now().toString(),
    songId,
    userId: (req.user as any).id,
    userName: (req.user as any).name,
    timestamp: Date.now()
  };

  queue.push(queueItem);
  res.json(queueItem);
});

// Get queue
karaokeRoutes.get('/queue', (req, res) => {
  const queueWithSongs = queue.map(item => ({
    ...item,
    song: songs.find(s => s.id === item.songId)
  }));
  res.json(queueWithSongs);
});

// Remove from queue
karaokeRoutes.delete('/queue/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const queueItemId = req.params.id;
  const index = queue.findIndex(item => item.id === queueItemId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Queue item not found' });
  }

  // Only allow users to remove their own items or implement admin logic
  const queueItem = queue[index];
  if (queueItem.userId !== (req.user as any).id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  queue.splice(index, 1);
  res.json({ success: true });
});

// Get next song in queue
karaokeRoutes.post('/queue/next', (req, res) => {
  if (queue.length === 0) {
    return res.status(404).json({ error: 'Queue is empty' });
  }

  const nextItem = queue.shift();
  const song = songs.find(s => s.id === nextItem!.songId);
  
  res.json({
    ...nextItem,
    song
  });
});