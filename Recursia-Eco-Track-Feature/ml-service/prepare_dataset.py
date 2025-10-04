"""
Dataset Preparation Script for EcoTrack Waste Classification
Splits the dataset from train folder into train/val/test folders
"""

import os
import shutil
import random
from collections import defaultdict

# Configuration
DATA_DIR = "dataset"
TRAIN_RATIO = 0.8
VAL_RATIO = 0.1  
TEST_RATIO = 0.1
CLASSES = ['e-waste', 'metal', 'organic', 'paper', 'plastic', 'trash']

def prepare_dataset():
    """Split dataset into train/val/test folders"""
    
    # Check if split already exists and has data
    val_has_data = False
    test_has_data = False
    
    if os.path.exists(os.path.join(DATA_DIR, "val")):
        for class_name in CLASSES:
            val_class_path = os.path.join(DATA_DIR, "val", class_name)
            if os.path.exists(val_class_path) and len(os.listdir(val_class_path)) > 0:
                val_has_data = True
                break
    
    if os.path.exists(os.path.join(DATA_DIR, "test")):
        for class_name in CLASSES:
            test_class_path = os.path.join(DATA_DIR, "test", class_name)
            if os.path.exists(test_class_path) and len(os.listdir(test_class_path)) > 0:
                test_has_data = True
                break
    
    if val_has_data and test_has_data:
        print("✅ Dataset already split into train/val/test")
        return
    
    print("🔄 Preparing dataset split...")
    
    # Create directories
    for split in ['train', 'val', 'test']:
        for class_name in CLASSES:
            os.makedirs(os.path.join(DATA_DIR, split, class_name), exist_ok=True)
    
    # Process each class
    for class_name in CLASSES:
        source_dir = os.path.join(DATA_DIR, "train", class_name)
        
        if not os.path.exists(source_dir):
            print(f"⚠️  Warning: {source_dir} not found")
            continue
            
        # Get all image files
        image_files = [f for f in os.listdir(source_dir) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'))]
        
        if not image_files:
            print(f"⚠️  Warning: No images found in {class_name}")
            continue
            
        # Shuffle for random split
        random.shuffle(image_files)
        
        # Calculate split indices
        total_images = len(image_files)
        train_end = int(total_images * TRAIN_RATIO)
        val_end = train_end + int(total_images * VAL_RATIO)
        
        # Split files
        train_files = image_files[:train_end]
        val_files = image_files[train_end:val_end] 
        test_files = image_files[val_end:]
        
        # Move files to appropriate directories
        # Keep train files in place, move val and test
        for filename in val_files:
            src = os.path.join(source_dir, filename)
            dst = os.path.join(DATA_DIR, "val", class_name, filename)
            shutil.move(src, dst)
            
        for filename in test_files:
            src = os.path.join(source_dir, filename)
            dst = os.path.join(DATA_DIR, "test", class_name, filename)
            shutil.move(src, dst)
        
        print(f"📁 {class_name}: {len(train_files)} train, {len(val_files)} val, {len(test_files)} test")
    
    print("✅ Dataset preparation complete!")

def show_dataset_info():
    """Display dataset information"""
    print("\n📊 Dataset Information:")
    print("-" * 50)
    
    for split in ['train', 'val', 'test']:
        split_path = os.path.join(DATA_DIR, split)
        if not os.path.exists(split_path):
            print(f"{split.upper()}: Directory not found")
            continue
            
        total_images = 0
        print(f"\n{split.upper()}:")
        
        for class_name in CLASSES:
            class_path = os.path.join(split_path, class_name)
            if os.path.exists(class_path):
                count = len([f for f in os.listdir(class_path) 
                           if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'))])
                print(f"  {class_name}: {count} images")
                total_images += count
            else:
                print(f"  {class_name}: 0 images")
                
        print(f"  Total: {total_images} images")
    
    print("-" * 50)

if __name__ == "__main__":
    # Set random seed for reproducibility
    random.seed(42)
    
    # Prepare dataset
    prepare_dataset()
    
    # Show dataset info
    show_dataset_info()