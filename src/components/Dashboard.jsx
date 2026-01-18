// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}api/youtube/video/${id}`, {
        withCredentials: true
      });
      console.log("response",response)
      setVideoDetails(response.data);
      setComments(response.data.comments || []);
      setNotes(response.data.notes || []);
    } catch (err) {
      console.error('Error fetching video:', err);
    }
  };

  useEffect(() => {
    fetchVideoDetails(defaultVideoId);
  }, []);

  const addComment = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}`,
        { comment },
        { withCredentials: true }
      );
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
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}/${commentId}`,
        { withCredentials: true }
      );
      setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
      alert('Comment deleted!');
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const updateTitle = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}api/youtube/video/${videoId}`,
        { title: newTitle },
        { withCredentials: true }
      );
      alert('Title updated!');
      fetchVideoDetails();
    } catch (err) {
      console.error('Error updating title:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}api/youtube/notes/${videoId}`,
        { note: newNote },
        { withCredentials: true }
      );
      const addedNote = {
        id: response.data.id || Date.now(),
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
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}api/youtube/notes/${videoId}/${noteId}`,
        { withCredentials: true }
      );
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
      alert('Note deleted!');
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-500 rounded flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">YouTube Mini-App</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Video Manager</h2>
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
        </div>

        {videoDetails && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Comments ({comments.length})</h3>
            {comments.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.publishedAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No comments available</p>
            )}
            
            <div className="border-t pt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment here"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
              />
              <button
                onClick={addComment}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm"
              >
                Post Comment
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Notes for Video Improvement</h3>
            {notes.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                        <p className="text-gray-700 text-sm mt-1">{note.text}</p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No notes available</p>
            )}
            
            <div className="border-t pt-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Jot down ideas for improving the video"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
              />
              <button
                onClick={addNote}
                className="mt-2 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition text-sm"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Update Title Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Update Video Title</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New video title"
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
};

export default Dashboard;