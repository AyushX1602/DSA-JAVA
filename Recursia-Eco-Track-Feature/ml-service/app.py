import io
import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
from flask import Flask, request, jsonify
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Model configuration
MODEL_PATH = 'saved_model/waste_classifier.pth'
CLASS_NAMES_PATH = 'saved_model/class_names.json'

# Global variables for model and class names
model = None
class_names = None

def load_model():
    """Load the trained PyTorch model"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            # Create the model architecture (same as in training)
            model = models.mobilenet_v2(weights=None)
            # Modify the classifier to match your number of classes
            # This will be updated when we load the actual model
            model.classifier[1] = nn.Linear(model.last_channel, 6)  # Assuming 6 classes
            
            # Load the trained weights
            checkpoint = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
            model.load_state_dict(checkpoint)
            model.eval()
            print("Model loaded successfully!")
        else:
            print(f"Model file {MODEL_PATH} not found!")
            return False
    except Exception as e:
        print(f"Error loading model: {e}")
        return False
    return True

def load_class_names():
    """Load class names from file or use default ones"""
    global class_names
    try:
        if os.path.exists(CLASS_NAMES_PATH):
            with open(CLASS_NAMES_PATH, 'r') as f:
                class_names = json.load(f)
        else:
            # Default class names based on your dataset structure
            class_names = ['e-waste', 'metal', 'organic', 'paper', 'plastic', 'trash']
            # Save default class names
            os.makedirs(os.path.dirname(CLASS_NAMES_PATH), exist_ok=True)
            with open(CLASS_NAMES_PATH, 'w') as f:
                json.dump(class_names, f)
        print(f"Loaded {len(class_names)} classes: {class_names}")
    except Exception as e:
        print(f"Error loading class names: {e}")
        class_names = ['e-waste', 'metal', 'organic', 'paper', 'plastic', 'trash']
    return class_names

# Image transformation pipeline (should match training transforms)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def preprocess_image(image):
    """Preprocess the uploaded image"""
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply transforms
        input_tensor = transform(image)
        input_batch = input_tensor.unsqueeze(0)  # Add batch dimension
        
        return input_batch
    except Exception as e:
        raise Exception(f"Error preprocessing image: {e}")

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Waste Classification API is running',
        'model_loaded': model is not None,
        'classes': class_names
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict waste category from uploaded image"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
        
        # Read and preprocess image
        img_bytes = file.read()
        image = Image.open(io.BytesIO(img_bytes))
        input_tensor = preprocess_image(image)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted = torch.max(probabilities, 0)
            
            class_idx = predicted.item()
            class_name = class_names[class_idx]
            confidence_score = confidence.item()
            
            # Get top 3 predictions
            top3_prob, top3_indices = torch.topk(probabilities, 3)
            top3_predictions = []
            for i in range(3):
                top3_predictions.append({
                    'class': class_names[top3_indices[i].item()],
                    'confidence': top3_prob[i].item()
                })
        
        return jsonify({
            'success': True,
            'prediction': {
                'class': class_name,
                'confidence': confidence_score,
                'class_index': class_idx
            },
            'top3_predictions': top3_predictions,
            'all_classes': class_names
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'classes': class_names,
        'num_classes': len(class_names) if class_names else 0,
        'input_size': [224, 224],
        'model_type': 'MobileNetV2'
    })

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available classes"""
    return jsonify({
        'classes': class_names,
        'num_classes': len(class_names) if class_names else 0
    })

if __name__ == '__main__':
    print("Starting Waste Classification API...")
    
    # Load class names
    load_class_names()
    
    # Load model
    if load_model():
        print("API is ready!")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("Failed to load model. Please check if model file exists.")
        print("You can still run the API, but predictions won't work until model is loaded.")
        app.run(host='0.0.0.0', port=5000, debug=True)