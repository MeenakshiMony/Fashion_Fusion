import React, { useState } from "react";
import axios from "axios";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import "../styles/AddPost.css";

const AddPost = ({ userId, onClose }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [fashionCategory, setFashionCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (isOpen) => {
    setDropdownOpen(isOpen);
 };  

  const handleFashionCategorySelect = (category) => {
    setFashionCategory(category);
    setDropdownOpen(false);
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/addpost", 
        {
        userId,
        content,
        imageUrl,
        tags: tags.split(",").map((tag) => tag.trim()), // Convert comma-separated string to an array
        fashionCategory,
      });
      setSuccess("Post added successfully!");
      setContent("");
      setImageUrl("");
      setTags("");
      setFashionCategory("");
      onClose(); 
      console.log(response);
    } catch (error) {
      setError("Error creating post. Please try again.");
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="input-group">
            <label>Image (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
            {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" />}
          </div>

          {/* Tags Input */}
          <div className="input-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g., fashion, outfit"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Fashion Category Dropdown */}
          <div className="input-group dropdown-button-wrapper">
            <label>Fashion Category</label>
            <DropdownButton
              id="dropdown-fashion-category"
              title={fashionCategory || "Select Category"}
              variant="outline-secondary"
              show={dropdownOpen}
              onToggle={handleToggle}
            >
              <Dropdown.Item
                eventKey="Outfit"  onClick={() => handleFashionCategorySelect("Outfit")}>Outfit</Dropdown.Item>
              <Dropdown.Item eventKey="Accessories" onClick={() => handleFashionCategorySelect("Accessories")}>Accessories</Dropdown.Item>
              <Dropdown.Item eventKey="Shoes" onClick={() => handleFashionCategorySelect("Shoes")}>Shoes</Dropdown.Item>
            </DropdownButton>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">Post</button>
        </form>

        {/* Error and Success Messages */}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {/* Close Button */}
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddPost;
