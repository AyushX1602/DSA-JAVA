"""
EcoTrack PyTorch Training Script - Waste Classification

Categories: e-waste, metal, organic, paper, plastic, trash
"""

import os
import random
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# --- Config ---
DATA_DIR = "dataset"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS_HEAD = 5
EPOCHS_FINE_TUNE = 5
MODEL_PATH = "saved_model/waste_classifier.pth"
CLASSES = ['e-waste', 'metal', 'organic', 'paper', 'plastic', 'trash']
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Reproducibility ---
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)
if DEVICE.type == 'cuda':
    torch.cuda.manual_seed_all(42)

# --- Data Augmentation & Preprocessing ---
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_test_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# --- Load Datasets ---
train_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), transform=train_transform)
val_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "val"), transform=val_test_transform)
test_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "test"), transform=val_test_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# --- Build Model (MobileNetV2) ---
model = models.mobilenet_v2(pretrained=True)
num_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_features, len(CLASSES))
model = model.to(DEVICE)

# --- Loss & Optimizer ---
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# --- Training Function ---
def train_model(model, train_loader, val_loader, criterion, optimizer, epochs, fine_tune=False):
    if fine_tune:
        # Unfreeze all layers for fine-tuning
        for param in model.parameters():
            param.requires_grad = True

    train_acc_history = []
    val_acc_history = []

    for epoch in range(epochs):
        model.train()
        running_loss = 0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels).item()
            total += labels.size(0)

        train_acc = correct / total
        train_acc_history.append(train_acc)

        # Validation
        model.eval()
        correct_val = 0
        total_val = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels).item()
                total_val += labels.size(0)

        val_acc = correct_val / total_val
        val_acc_history.append(val_acc)

        print(f"Epoch [{epoch+1}/{epochs}] "
              f"Train Acc: {train_acc:.4f} Val Acc: {val_acc:.4f}")

    return train_acc_history, val_acc_history

if __name__ == '__main__':
    # --- Phase 1: Train Head Only ---
    # Freeze base layers
    for param in model.features.parameters():
        param.requires_grad = False

    print("🔹 Training classifier head...")
    train_model(model, train_loader, val_loader, criterion, optimizer, EPOCHS_HEAD)

    # --- Phase 2: Fine-Tune Last Layers ---
    # Fine-tune last 50 layers of features
    for param in list(model.features.parameters())[:-50]:
        param.requires_grad = False
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-5)

    print("🔹 Fine-tuning last 50 layers...")
    train_model(model, train_loader, val_loader, criterion, optimizer, EPOCHS_FINE_TUNE, fine_tune=True)

    # --- Save Model ---
    os.makedirs("saved_model", exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"✅ Model saved as {MODEL_PATH}")

    # --- Evaluate on Test Set ---
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    print("\n📊 Classification Report:")
    print(classification_report(all_labels, all_preds, target_names=CLASSES))

    # Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASSES, yticklabels=CLASSES)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.title('Confusion Matrix')
    plt.savefig('saved_model/confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.show()
