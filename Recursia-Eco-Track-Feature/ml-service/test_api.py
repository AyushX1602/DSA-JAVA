"""
Simple test script for the Waste Classification API
"""
import requests
import os
import json

def test_api_endpoints():
    """Test all API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Waste Classification API")
    print("=" * 40)
    
    # Test 1: Health check
    print("1. Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check passed")
            print(f"   📊 Status: {data.get('status')}")
            print(f"   🤖 Model loaded: {data.get('model_loaded')}")
            print(f"   🏷️  Classes: {data.get('classes')}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to API. Make sure it's running on localhost:5000")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print()
    
    # Test 2: Model info
    print("2. Testing model info endpoint...")
    try:
        response = requests.get(f"{base_url}/model-info")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Model info retrieved")
            print(f"   🏗️  Model type: {data.get('model_type')}")
            print(f"   📐 Input size: {data.get('input_size')}")
            print(f"   🔢 Number of classes: {data.get('num_classes')}")
        else:
            print(f"   ❌ Model info failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # Test 3: Classes endpoint
    print("3. Testing classes endpoint...")
    try:
        response = requests.get(f"{base_url}/classes")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Classes retrieved")
            print(f"   🏷️  Available classes: {data.get('classes')}")
        else:
            print(f"   ❌ Classes endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # Test 4: Prediction endpoint (if test image exists)
    print("4. Testing prediction endpoint...")
    test_image_path = None
    
    # Look for any image in the dataset to test with
    for root, dirs, files in os.walk("dataset/test"):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                test_image_path = os.path.join(root, file)
                break
        if test_image_path:
            break
    
    if test_image_path and os.path.exists(test_image_path):
        try:
            with open(test_image_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{base_url}/predict", files=files)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Prediction successful")
                print(f"   🎯 Predicted class: {data['prediction']['class']}")
                print(f"   📊 Confidence: {data['prediction']['confidence']:.4f}")
                print(f"   🏆 Top 3 predictions:")
                for i, pred in enumerate(data['top3_predictions'][:3]):
                    print(f"      {i+1}. {pred['class']}: {pred['confidence']:.4f}")
            else:
                print(f"   ❌ Prediction failed: {response.status_code}")
                print(f"   📝 Response: {response.text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print("   ⚠️  No test image found in dataset/test directory")
        print("   💡 You can manually test with: curl -X POST -F \"file=@your_image.jpg\" http://localhost:5000/predict")
    
    print()
    print("🎉 API testing complete!")
    print("📖 API Documentation:")
    print("   GET  /          - Health check")
    print("   GET  /model-info - Model information")
    print("   GET  /classes   - Available classes")
    print("   POST /predict   - Upload image for prediction")
    
    return True

if __name__ == "__main__":
    test_api_endpoints()