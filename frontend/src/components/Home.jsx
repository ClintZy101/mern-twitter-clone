import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const [posts, setPosts] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [editPost, setEditPost] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  //   console.log(token);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch posts on load
  const fetchPosts = async () => {
    const response = await axios.get("http://localhost:5400/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts(response?.data.data);
    console.log(response.data.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Create a new post
  const handleCreate = async () => {
    if (newPost.trim() === "") return;

    try {
      const response = await axios.post("http://localhost:5400/api/posts", {
        email: user.email,
        post: newPost,
      });

      console.log(response.data);

      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error(
        "Error creating post:",
        error.response?.data || error.message
      );
    }
  };

  // Update a post
  const handleUpdate = async (id, updatedContent) => {
    try {
      const response = await axios.put(
        `http://localhost:5400/api/posts/${id}`,
        {
          post: updatedContent, // Send the updated content to the backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers for authentication
          },
        }
      );

      // Update the post in the state after a successful update
      setPosts(posts.map((post) => (post._id === id ? response.data : post)));
      setEditPost(null); // Reset the edit mode
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Delete a post
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5400/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers for authentication
        },
      });
      // Remove the deleted post from the state
      setPosts(posts.filter((post) => post._id !== id));
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const sortedDataToLatest = posts?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {/* Create Post */}
      <div className="mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700"
        >
          Post
        </button>
      </div>

      {/* Posts List */}
      
      <div>
        {sortedDataToLatest?.map((post) => (
          <div
            key={post._id}
            className="border p-4 rounded mb-4 bg-white shadow"
          >
            {editPost === post._id ? (
              <div>
                <textarea
                  defaultValue={post.post}
                  onBlur={(e) => handleUpdate(post._id, e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="w-full">
                <p>{post.post}</p>
                <p className="justify-self-end">by: {post.email}</p>
              </div>
            )}
            {user?.email === post.email && (
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setEditPost(post._id)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
