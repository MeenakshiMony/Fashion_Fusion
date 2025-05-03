from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Important for React connectivity
import numpy as np
import os
from werkzeug.utils import secure_filename
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
import json
import pickle
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Constants
FEATURE_MATRIX_PATH = "fashion_features.npy"
MAPPING_PATH = "fashion_item_mapping.json"
IMAGE_DIR = "images"

# Initialize resources
def load_resources():
    feature_matrix = np.load(FEATURE_MATRIX_PATH)
    with open(MAPPING_PATH) as f:
        fashion_item_map = json.load(f)
    model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
    knn = NearestNeighbors(n_neighbors=6, metric='cosine').fit(feature_matrix)
    return feature_matrix, fashion_item_map, model, knn

feature_matrix, fashion_item_map, resnet_model, knn = load_resources()

# Helper functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = resnet_model.predict(img_array).flatten()
    return features / np.linalg.norm(features)

# API Endpoints
@app.route('/api/recommend', methods=['POST'])
def recommend():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)

        # Process image
        features = extract_features(save_path)
        distances, indices = knn.kneighbors([features])

        # Prepare response
        recommendations = [
            {
                "id": int(idx),
                "image_url": f"/api/images/{fashion_item_map[str(idx)]}",
                "similarity": float(1 - distances[0][i])  # Convert distance to similarity
            }
            for i, idx in enumerate(indices[0])
            if str(idx) in fashion_item_map
        ]

        return jsonify({
            "success": True,
            "uploaded_image_url": f"/api/uploads/{filename}",
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/api/images/<filename>")
def serve_image(filename):
    try:
        return send_from_directory(IMAGE_DIR, filename)
    except FileNotFoundError:
        print(f"⚠️ Missing image: {filename} in {IMAGE_DIR}")
        return jsonify({"error": "Image not found"}), 404

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)