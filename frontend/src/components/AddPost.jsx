import React, { useState } from "react";
import axios from "axios";
import "../styles/AddPost.css";

const AddPost = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    content: "",
    imageFile: null,
    imageUrl: "",
    fashionCategory: "", // Ensure this starts empty
  });

  const [state, setState] = useState({
    error: "",
    success: "",
    loading: false,
  });

  // Allowed fashion categories
  const fashionCategories = ["Outfit", "Accessory", "StylingTips"];

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState({ ...state, error: "File size must be less than 5MB" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setState({ ...state, error: "Only image files are allowed" });
        return;
      }

      setFormData({ ...formData, imageFile: file });

      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleAddPost = async (e) => {
    e.preventDefault();
  
    // Validation checks
    if (!formData.content.trim()) {
      setState({ ...state, error: "Content cannot be empty" });
      return;
    }
    if (!fashionCategories.includes(formData.fashionCategory)) {
      setState({
        ...state,
        error: "Invalid fashion category. Choose from Outfit, Accessory, or StylingTips.",
      });
      return;
    }
  
    setState({ ...state, loading: true, error: "", success: "" });
  
    try {
      const postData = new FormData();
      postData.append("userId", userId);
      postData.append("content", formData.content);
      postData.append("fashionCategory", formData.fashionCategory);
  
      if (formData.imageFile) {
        postData.append("image", formData.imageFile);
      }
  
      // Log FormData contents
      console.log("Post Data:");
      for (let [key, value] of postData.entries()) {
        console.log(`${key}:`, value);
      }
  
      // ✅ FIX: Save response properly
      const response = await axios.post("http://localhost:8080/addpost", postData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Server Response:", response.data);
  
      // ✅ Corrected: Use response.data
      if (response.data.message === "Post added successfully!") {
        setState((prev) => ({
          ...prev,
          success: response.data.message,
          error: "",
          loading: false,
        }));
      }
  
      // ✅ Reset form after successful submission
      setFormData({
        content: "",
        imageFile: null,
        imageUrl: "",
        fashionCategory: "",
      });
  
      onClose(); // Close modal if success
    } catch (error) {
      console.error("Post Error:", error.response ? error.response.data : error.message);
  
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Error creating post. Please try again.",
        success: "",
        loading: false,
      }));
    }
  };
  

  return (
    <div className="add-post-modal">
      <div className="modal-content">
        <h2>Create a New Post</h2>
        <form onSubmit={handleAddPost}>
          {/* Content Input */}
          <div className="input-group">
            <label>Content</label>
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              aria-label="Post Content"
            />
          </div>

          {/* Image Upload */}
          <div className="input-group">
            <label>Upload Image</label>
            <input type="file" onChange={handleFileChange} accept="image/*" aria-label="Upload Image" />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="image-preview" />}
          </div>

          {/* Fashion Category Dropdown */}
          <div className="input-group">
            <label>Fashion Category</label>
            <select
              value={formData.fashionCategory}
              onChange={(e) => setFormData({ ...formData, fashionCategory: e.target.value })}
            >
              <option value="">Select a category</option>
              {fashionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={state.loading}>
            {state.loading ? "Posting..." : "Post"}
          </button>
        </form>

        {/* Error and Success Messages */}
        {state.error && <p className="error">{state.error}</p>}
        {state.success && <p className="success">{state.success}</p>}

        {/* Close Button */}
        <button className="close-button" onClick={() => window.location.reload()} aria-label="Close Modal">
          Close
        </button>
      </div>
    </div>
  );
};

export default AddPost;
