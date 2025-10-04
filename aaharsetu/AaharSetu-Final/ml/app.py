from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pdfkit
from jinja2 import Environment, FileSystemLoader
import os
import io  # Import BytesIO for in-memory file handling
from pymongo import MongoClient
from sklearn.neighbors import NearestNeighbors
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.utils.class_weight import compute_class_weight
from datetime import datetime
from sklearn.model_selection import train_test_split

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), "templates"))
CORS(app)

# MongoDB Connection for recommendations
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["AaharSetu"]
    donations_collection = db["donations"]
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    donations_collection = None

# Configure the path to wkhtmltopdf
WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe' 
config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

template_dir = os.path.join(os.path.dirname(__file__), 'templates')

def get_nearest_donations(latitude, longitude, foodType, quantity, n_neighbors=10):
    """Get nearest food donations based on location and requirements"""
    try:
        if not donations_collection:
            return []
            
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

        # Simple distance-based sorting (for basic functionality)
        ngo_point = (latitude, longitude)
        
        # Calculate distances and sort
        donations_with_distance = []
        for i, donation in enumerate(valid_donations):
            donor_lat, donor_lon = donor_locations[i]
            # Simple Euclidean distance (can be improved with Haversine)
            distance = ((donor_lat - latitude)**2 + (donor_lon - longitude)**2)**0.5
            donation["distance"] = distance
            donations_with_distance.append(donation)
        
        # Sort by distance and return top n_neighbors
        donations_with_distance.sort(key=lambda x: x["distance"])
        return donations_with_distance[:n_neighbors]

    except Exception as e:
        print(f"Error in get_nearest_donations: {e}")
        return []


@app.route('/generate', methods=['POST'])
def generate_certificate():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    recipient_name = data.get('name')

    if not recipient_name:
        return jsonify({"error": "Missing 'name' in request"}), 400

    try:
        # Render HTML template
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template('certificate_template.html')
        rendered_html = template.render(recipient_name=recipient_name)

        # Generate PDF directly from HTML content (no temporary files)
        pdf_bytes = pdfkit.from_string(rendered_html, False, configuration=config)

        # Create in-memory bytes buffer for the PDF
        pdf_stream = io.BytesIO(pdf_bytes)

        # Send the PDF as a downloadable attachment
        return send_file(
            pdf_stream,
            as_attachment=True,
            download_name='certificate.pdf',
            mimetype='application/pdf'
        )

    except Exception as e:
        app.logger.error(f"Error generating certificate: {str(e)}")
        return jsonify({"error": "Failed to generate certificate", "details": str(e)}), 500

@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend_donations():
    """Recommend food donations based on location and requirements"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.get_json()
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

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    """Basic prediction endpoint - returns sample data for now"""
    try:
        # For now, return a simple response
        # This can be enhanced with actual ML prediction logic
        return jsonify({
            "success": True,
            "prediction": "Sample prediction data",
            "message": "Prediction service is running"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)