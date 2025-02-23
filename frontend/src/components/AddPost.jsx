import React, { useState } from "react";
import axios from "axios";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import "../styles/AddPost.css";

const AddPost = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    content: "",
    imageUrl: "",
    tags: "",
    fashionCategory: "",
  });
  const [state, setState] = useState({
    error: "",
    success: "",
    dropdownOpen: false,
  });

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setState((prev) => ({ ...prev, error: "File size must be less than 5MB" }));
        return;
      }

      // Validate file type (only images)
      if (!file.type.startsWith("image/")) {
        setState((prev) => ({ ...prev, error: "Only image files are allowed" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (isOpen) => {
    setState((prev) => ({ ...prev, dropdownOpen: isOpen }));
  };

  const handleFashionCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, fashionCategory: category }));
    setState((prev) => ({ ...prev, dropdownOpen: false }));
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setState((prev) => ({ ...prev, error: "Content cannot be empty" }));
      return;
    }

    try {
      const response = await axios.post("/addpost", {
        userId,
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      });
      setState((prev) => ({ ...prev, success: "Post added successfully!", error: "" }));
      setFormData({
        content: "",
        imageUrl: "",
        tags: "",
        fashionCategory: "",
      });
      onClose();
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Error creating post. Please try again.", success: "" }));
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
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              aria-label="Post Content"
            />
          </div>

          {/* Image Upload */}
          <div className="input-group">
            <label>Upload Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              aria-label="Upload Image"
            />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="image-preview" />}
          </div>

          {/* Tags Input */}
          <div className="input-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g., fashion, outfit"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              aria-label="Post Tags"
            />
          </div>

          {/* Fashion Category Dropdown */}
          <div className="input-group dropdown-button-wrapper">
            <label>Fashion Category</label>
            <DropdownButton
              id="dropdown-fashion-category"
              title={formData.fashionCategory || "Select Category"}
              variant="outline-secondary"
              show={state.dropdownOpen}
              onToggle={handleToggle}
              aria-label="Select Fashion Category"
            >
              <Dropdown.Item eventKey="Outfit" onClick={() => handleFashionCategorySelect("Outfit")}>Outfit</Dropdown.Item>
              <Dropdown.Item eventKey="Accessories" onClick={() => handleFashionCategorySelect("Accessories")}>Accessories</Dropdown.Item>
              <Dropdown.Item eventKey="Shoes" onClick={() => handleFashionCategorySelect("Shoes")}>Shoes</Dropdown.Item>
            </DropdownButton>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" aria-label="Submit Post">Post</button>
        </form>

        {/* Error and Success Messages */}
        {state.error && <p className="error">{state.error}</p>}
        {state.success && <p className="success">{state.success}</p>}

        {/* Close Button */}
        <button className="close-button" onClick={onClose} aria-label="Close Modal">Close</button>
      </div>
    </div>
  );
};

export default AddPost;