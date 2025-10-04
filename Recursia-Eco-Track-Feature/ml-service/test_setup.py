"""
Test script to verify the Flask API setup and model loading
"""
import os
import sys

def check_file_exists(filepath, description):
    """Check if a file exists and print status"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"✅ {description}: {filepath} (Size: {size:,} bytes)")
        return True
    else:
        print(f"❌ {description}: {filepath} - FILE NOT FOUND")
        return False

def check_directory_structure():
    """Check if all required directories and files exist"""
    print("🔍 Checking ML Service Setup...")
    print("=" * 50)
    
    base_dir = os.getcwd()
    print(f"📁 Current directory: {base_dir}")
    print()
    
    # Check required files
    files_to_check = [
        ("app.py", "Flask API file"),
        ("train.py", "Training script"),
        ("prepare_dataset.py", "Dataset preparation script"),
        ("requirements.txt", "Dependencies file"),
        ("saved_model/waste_classifier.pth", "Trained model"),
        ("saved_model/class_names.json", "Class names configuration"),
        ("saved_model/confusion_matrix.png", "Model evaluation plot")
    ]
    
    all_files_exist = True
    for filename, description in files_to_check:
        if not check_file_exists(filename, description):
            all_files_exist = False
    
    print()
    
    # Check dataset structure
    print("📊 Dataset Structure:")
    dataset_path = "dataset"
    if os.path.exists(dataset_path):
        for split in ['train', 'val', 'test']:
            split_path = os.path.join(dataset_path, split)
            if os.path.exists(split_path):
                classes = [d for d in os.listdir(split_path) if os.path.isdir(os.path.join(split_path, d))]
                print(f"  {split}/: {len(classes)} classes - {classes}")
            else:
                print(f"  {split}/: NOT FOUND")
    else:
        print("  Dataset directory not found!")
        all_files_exist = False
    
    print()
    
    # Check class names
    class_names_path = "saved_model/class_names.json"
    if os.path.exists(class_names_path):
        try:
            import json
            with open(class_names_path, 'r') as f:
                class_names = json.load(f)
            print(f"🏷️  Classes configured: {class_names}")
        except Exception as e:
            print(f"❌ Error reading class names: {e}")
    
    print()
    
    # Summary
    if all_files_exist:
        print("✅ All required files are present!")
        print("🚀 Your ML service is ready to run!")
        print("\nTo start the API:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run the API: python app.py")
        print("3. Test at: http://localhost:5000")
    else:
        print("❌ Some files are missing. Please check the errors above.")
    
    return all_files_exist

if __name__ == "__main__":
    check_directory_structure()