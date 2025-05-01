import React, { useState } from "react";
import axios from "axios";
import "../styles/AddPost.css";

const AddPost = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    content: "",
    imageFile: null,
    imageUrl: "",
    fashionCategory: "",
  });

  const [state, setState] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const fashionCategories = ["Outfit", "Accessory", "StylingTips"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Clear any previous error when a new file is selected
    setState(prev => ({ ...prev, error: "" }));

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setState({ ...state, error: "File size must be less than 5MB", success: "" });
        // Clear the file input and any previous file data
        e.target.value = "";
        setFormData(prev => ({ ...prev, imageFile: null, imageUrl: "" }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setState({ ...state, error: "Only image files are allowed",success: "" });
        e.target.value = "";
        setFormData(prev => ({ ...prev, imageFile: null, imageUrl: "" }));
        return;
      }

      // If we get here, the file is valid
      setFormData(prev => ({ ...prev, imageFile: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setState({ ...state, error: "", success: "" });

    // Validate content
    if (!formData.content.trim()) {
      setState({ ...state, error: "Content cannot be empty" });
      return;
    }

    // Validate category
    if (!fashionCategories.includes(formData.fashionCategory)) {
      setState({ ...state, error: "Invalid fashion category. Choose from Outfit, Accessory, or StylingTips." });
      return;
    }

    // If an image was selected but exceeds size limit, prevent submission
    if (formData.imageFile?.size > MAX_FILE_SIZE) {
      setState({ ...state, error: "File size must be less than 5MB. Imnage won't be saved." });
      return;
    }

    setState({ ...state, loading: true });

    try {
      const postData = new FormData();
      postData.append("userId", userId);
      postData.append("content", formData.content);
      postData.append("fashionCategory", formData.fashionCategory);
      if (formData.imageFile) postData.append("image", formData.imageFile);

      const response = await axios.post("http://localhost:8080/addpost", postData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message === "Post added successfully!") {
        setState({ success: response.data.message, error: "", loading: false });
        setFormData({ content: "", imageFile: null, imageUrl: "", fashionCategory: "" });

        if (typeof onClose === "function") {
          onClose();
        }
      }
    } catch (error) {
      console.error("Post Error:", error.response ? error.response.data : error.message);
      setState({ 
        error: error.response?.data?.message || "Error creating post. Please try again.", 
        success: "", 
        loading: false 
      });
    }
  };

  return (
    <div className="add-post-modal">
      <div className="modal-content">
        <h2>Create a New Post</h2>
        <form onSubmit={handleAddPost}>
          <div className="input-group">
            <label>Content</label>
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              aria-label="Post Content"
              required
            />
          </div>

          <div className="input-group">
            <label>Upload Image (max 5MB)</label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="image/*" 
              aria-label="Upload Image" 
            />
            {formData.imageUrl && (
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="image-preview" 
                onError={(e) => { e.target.style.display = 'none' }} 
              />
            )}
          </div>

          <div className="input-group">
            <label>Fashion Category</label>
            <select
              value={formData.fashionCategory}
              onChange={(e) => setFormData({ ...formData, fashionCategory: e.target.value })}
              aria-label="Select Fashion Category"
              required
            >
              <option value="">Select a category</option>
              {fashionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {state.error && <p className="error">{state.error}</p>}
          {state.success && <p className="success">{state.success}</p>}

          <div className="button-group">
            <button type="submit" className="submit-button" disabled={state.loading}>
              {state.loading ? "Posting..." : "Post"}
            </button>
            <button 
              type="button" 
              className="close-button" 
              onClick={() => onClose()} 
              aria-label="Close Modal"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPost;