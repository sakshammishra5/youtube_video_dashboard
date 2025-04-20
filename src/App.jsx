import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  console.log(import.meta.env.VITE_BASE_URI);
  const defaultVideoId = 'IqLWMJB8hYk';
  const [videoId, setVideoId] = useState(defaultVideoId);
  const [videoDetails, setVideoDetails] = useState(null);
  const [comment, setComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const fetchVideoDetails = async (id = videoId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}api/youtube/video/${id}`);
      setVideoDetails(response.data);
      setComments(response.data.comments || []);
      setNotes(response.data.notes || []); // Assuming the API returns notes
    } catch (err) {
      console.error('Error fetching video:', err);
    }
  };

  useEffect(() => {
    fetchVideoDetails(defaultVideoId);
  }, []);

  const addComment = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}`, { comment });
      const newComment = {
        id: response.data.id,
        text: response.data.snippet.topLevelComment.snippet.textOriginal,
        author: response.data.snippet.topLevelComment.snippet.authorDisplayName,
        publishedAt: response.data.snippet.topLevelComment.snippet.publishedAt,
      };
      setComments((prevComments) => [...prevComments, newComment]);
      alert('Comment added!');
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}/${commentId}`);
      setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
      alert('Comment deleted!');
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const updateTitle = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URI}api/youtube/video/${videoId}`, { title: newTitle });
      alert('Title updated!');
      fetchVideoDetails();
    } catch (err) {
      console.error('Error updating title:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}api/youtube/notes/${videoId}`, { note: newNote });
      const addedNote = {
        id: response.data.id || Date.now(), // Fallback ID if not provided by API
        text: newNote,
        createdAt: new Date().toISOString(),
      };
      setNotes((prevNotes) => [...prevNotes, addedNote]);
      alert('Note added!');
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}api/youtube/notes/${videoId}/${noteId}`);
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
      alert('Note deleted!');
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const startOAuth = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URI}auth/google`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <button
          onClick={startOAuth}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Login with Google
        </button>
        <h1 className="text-2xl font-bold text-center text-gray-800">YouTube Mini-App</h1>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter YouTube Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchVideoDetails(videoId)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Fetch Video
          </button>
        </div>

        {videoDetails && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={videoDetails.snippet.thumbnails.maxres.url}
                alt={videoDetails.snippet.title}
                className="w-full rounded-md shadow-sm"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{videoDetails.snippet.title}</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{videoDetails.snippet.channelTitle}</span>
              <span>Published on {formatDate(videoDetails.snippet.publishedAt)}</span>
            </div>
            <div className="text-gray-700">
              <p>{videoDetails.snippet.description || 'No description available'}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Comments ({comments.length})</h3>
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{comment.author}</span>
                      <span className="text-sm text-gray-500 ml-2">{formatDate(comment.publishedAt)}</span>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No comments available</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Add a Comment</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment here"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <button
            onClick={addComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Post Comment
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Notes for Video Improvement</h3>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Jot down ideas for improving the video"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <button
            onClick={addNote}
            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
          >
            Add Note
          </button>
          {notes.length > 0 ? (
            <ul className="space-y-4 mt-4">
              {notes.map((note) => (
                <li key={note.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                      <p className="text-gray-700">{note.text}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mt-2">No notes available</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Update Video Title</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New video title"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={updateTitle}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
          >
            Update Title
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;