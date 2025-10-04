from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from sklearn.neighbors import NearestNeighbors
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from the frontend
CORS(app, resources={
    r"/recommend": {
        "origins": "*",  
        "methods": ["POST", "OPTIONS"],  # Allow POST and OPTIONS for preflight
        "allow_headers": ["Content-Type"]
    }
})

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["AaharSetu"]
donations_collection = db["donations"]

def get_nearest_donations(latitude, longitude, foodType, quantity, n_neighbors=10):
    try:
        # Fetch donations matching food type and minimum quantity
        donations = list(donations_collection.find({
            "foodType": foodType,  
            "quantity": {"$gte": quantity}  
        }))

        if not donations:
            return []

        donor_locations = []
        valid_donations = []
        
        for donation in donations:
            lat, lon = donation.get("latitude"), donation.get("longitude")
            if lat is not None and lon is not None:
                # Convert all ObjectId fields to strings
                donation["_id"] = str(donation["_id"])
                if "donorId" in donation:
                    donation["donorId"] = str(donation["donorId"])
                if "ngoId" in donation:
                    donation["ngoId"] = str(donation["ngoId"])
                if "claimedBy" in donation:
                    donation["claimedBy"] = str(donation["claimedBy"])
                
                donor_locations.append((lat, lon))
                valid_donations.append(donation)

        if not donor_locations:
            return []

        # Convert coordinates to radians for Haversine distance calculation
        donor_array = np.radians(donor_locations)
        ngo_point = np.radians([[latitude, longitude]])

        # KNN Model for nearest neighbors
        knn = NearestNeighbors(n_neighbors=min(n_neighbors, len(donor_locations)), metric="haversine")
        knn.fit(donor_array)

        distances, indices = knn.kneighbors(ngo_point)

        recommendations = []
        for i, idx in enumerate(indices[0]):
            donation = valid_donations[idx]
            donation["distance_km"] = round(distances[0][i] * 6371, 2)  # Convert to kilometers
            recommendations.append(donation)

        return sorted(recommendations, key=lambda x: x["distance_km"])
    except Exception as e:
        return {"error": str(e)}

# Handle OPTIONS requests for preflight
@app.route("/recommend", methods=["OPTIONS"])
def handle_options():
    return jsonify({}), 200

# Handle POST requests for recommendations
@app.route("/recommend", methods=["POST"])
def recommend_donations():
    try:
        if request.content_type != "application/json":
            return jsonify({"error": "Unsupported Media Type: Use application/json"}), 415
        
        data = request.json
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        foodType = data.get("foodType")  
        quantity = data.get("quantity")

        if not all([latitude, longitude, foodType, quantity]):
            return jsonify({"error": "Missing required fields"}), 400

        recommendations = get_nearest_donations(latitude, longitude, foodType, quantity)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5001)