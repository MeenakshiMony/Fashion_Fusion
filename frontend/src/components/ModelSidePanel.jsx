import React, { useState, useEffect, useMemo } from 'react';
import "@google/model-viewer";

const ModelSidePanel = ({ onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    // Fetch models from the API
    fetch('http://localhost:8080/models')
      .then((response) => response.json())
      .then((data) => {
        setModels(data); // Store the list of models in state
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
      });
  }, []);

  const handleModelSelection = (model) => {
    setSelectedOutfit(model);
    onModelSelect(model); // Notify the parent component about the selected model
  };

  const modelList = useMemo(() => (
    models.map((model, index) => (
      <li key={index} className="model-item" onClick={() => handleModelSelection(model)}>
        <model-viewer src={model.url} alt={model.name} auto-rotate camera-controls style={{ width: "200px", height: "200px" }} ></model-viewer>
        <p>{model.name}</p>
      </li>
    ))
  ), [models]);

  return (
    <div className="outfit-selection">
      <h2>Select an Outfit</h2>
      <div className="outfit-grid">
        <div className="outfit-card">
          <h2>Select a Model</h2>
          {selectedOutfit && <p>You selected: {selectedOutfit.name}</p>}
          <ul className="model-list">{modelList}</ul>
        </div>
      </div>

      <div className="upload-container">
        <input type="file" id="upload-avatar" aria-label="Upload your avatar image"/>
        <label htmlFor="upload-avatar" className="upload-button">
          Upload Outfit
        </label>
      </div>
    </div>
  );
};

export default ModelSidePanel;