from flask import Flask, request, jsonify
import numpy as np
import json
import os
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.neighbors import NearestNeighbors
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.models import Model

app = Flask(__name__)
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load precomputed feature matrix
FEATURE_MATRIX_PATH = "fashion_features.npy"
MAPPING_PATH = "fashion_item_mapping.json"


def load_feature_matrix(file_path):
    if file_path.endswith(".txt"):
        return np.loadtxt(file_path)
    elif file_path.endswith(".pkl"):
      with open(file_path, "rb") as f:  # ✅ Open the file in binary mode
        return pickle.load(f)  

    elif file_path.endswith(".npy"):
        return np.load(file_path)
    raise ValueError("Unsupported file format. Use .txt or .npy")

# Load the full feature matrix
feature_matrix = load_feature_matrix(FEATURE_MATRIX_PATH)
#feature_matrix = feature_matrix / np.linalg.norm(feature_matrix, axis=1, keepdims=True)

# Load the mapping (ID → Image)
with open(MAPPING_PATH, "r") as f:
    fashion_item_map = json.load(f)

# Load ResNet50 and add Global Average Pooling to get (2048,) features
base_model = ResNet50(weights='imagenet', include_top=False,pooling='avg')
#global_avg_pool = GlobalAveragePooling2D()(base_model.output)
resnet_model = Model(inputs=base_model.input, outputs=base_model.output)


# Load pre-trained ResNet model
# Load Pretrained Model
#resnet_model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
#resnet_model= ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Function to Extract Features
def extract_features(image_path):
    img = image.load_img(image_path,target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array,axis=0)
    img_array = preprocess_input(img_array)
    
    features = resnet_model.predict(img_array).flatten()
    norm_result = features / np.linalg.norm(features)
    print(f"Extracted feature shape: {features.shape}") 
    return norm_result


def recommend_similar_items(feature_vector, feature_matrix, top_n=6):
     
    knn = NearestNeighbors(n_neighbors=top_n, metric="cosine")
    knn.fit(feature_matrix)
    distances, indices = knn.kneighbors([feature_vector])
    print(distances,indices)
    return indices[0].tolist()

@app.route("/", methods=["GET", "POST"])
def index():
    recommendations = []
    uploaded_image = None

    if request.method == "POST":
        if "file" not in request.files:
            return "No file uploaded"

        file = request.files["file"]
        if file.filename == "":
            return "No selected file"

        # Save uploaded image
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(image_path)
        uploaded_image = f"/{image_path}"  # Store uploaded image URL

        # Extract features from the uploaded image
        feature_vector = extract_features(image_path)

        # Get recommendations
        recommended_indices = recommend_similar_items(feature_vector, feature_matrix)

        # Map recommended IDs to image paths
        recommendations = [
            {"id": idx, "image_url": f"/static/images/{fashion_item_map[str(idx)]}"}
            for idx in recommended_indices if str(idx) in fashion_item_map
        ]

    return jsonify({
    "uploaded_image": uploaded_image,
    "recommendations": recommendations
})

if __name__ == "__main__":
    app.run(debug=True)
