import os
import json
import random
from PIL import Image
import itertools

# Configuration
LAYER_ORDER = ["Background", "Body", "Eyes", "Mouth", "Hands", "Headgear"]
BASE_DIR = "layers"
OUTPUT_IMAGES_DIR = "output_images"
OUTPUT_METADATA_DIR = "output_metadata"
TOTAL_NFTS = 4590

# Ensure output directories exist
os.makedirs(OUTPUT_IMAGES_DIR, exist_ok=True)
os.makedirs(OUTPUT_METADATA_DIR, exist_ok=True)

# Load all layer images
layers = {}
for layer in LAYER_ORDER:
    layer_path = os.path.join(BASE_DIR, layer)
    layers[layer] = [f for f in os.listdir(layer_path) if f.endswith(".PNG")]
    if not layers[layer]:
        raise ValueError(f"No images found in {layer_path}")
    print(f"{layer}: {len(layers[layer])} options")

# Calculate max possible combinations
max_combinations = 1
for layer in LAYER_ORDER:
    max_combinations *= len(layers[layer])
print(f"\nMax possible combinations: {max_combinations:,}")

if TOTAL_NFTS > max_combinations:
    raise ValueError(f"Cannot generate {TOTAL_NFTS} unique NFTs. Maximum possible is {max_combinations}")

if TOTAL_NFTS > max_combinations * 0.8:
    print(f"Warning: Requesting {TOTAL_NFTS} out of {max_combinations} combinations ({(TOTAL_NFTS/max_combinations)*100:.1f}%)")
    print("This may take longer as we approach the limit. Consider adding more trait variety.\n")

# Generate all possible combinations and shuffle
print("Generating all possible combinations...")
all_combinations = list(itertools.product(*[layers[layer] for layer in LAYER_ORDER]))
random.shuffle(all_combinations)
print(f"Total combinations: {len(all_combinations):,}")

# Take first TOTAL_NFTS combinations (guaranteed unique)
selected_combinations = all_combinations[:TOTAL_NFTS]

print(f"\nGenerating {TOTAL_NFTS} NFTs...")
for idx, combination in enumerate(selected_combinations):
    # Create trait dictionary
    selected_traits = {LAYER_ORDER[i]: combination[i] for i in range(len(LAYER_ORDER))}
    
    # Stack images
    base_image = Image.open(
        os.path.join(BASE_DIR, LAYER_ORDER[0], selected_traits[LAYER_ORDER[0]])
    ).convert("RGBA")
    
    for layer in LAYER_ORDER[1:]:
        layer_image = Image.open(
            os.path.join(BASE_DIR, layer, selected_traits[layer])
        ).convert("RGBA")
        base_image = Image.alpha_composite(base_image, layer_image)
    
    # Save image
    output_path = os.path.join(OUTPUT_IMAGES_DIR, f"{idx}.png")
    base_image.save(output_path, "PNG")
    
    # Generate metadata
    metadata = {
        "name": f"Smoothies #{idx}",
        "description": "4 ur helth. stay smooth.",
        "image": f"https://img_smoothies.arweave.net/{idx}.png",
        "attributes": [
            {"trait_type": layer, "value": os.path.splitext(trait)[0]} 
            for layer, trait in selected_traits.items()
        ]
    }
    
    # Save metadata
    metadata_path = os.path.join(OUTPUT_METADATA_DIR, f"{idx}.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    
    # Progress update
    if (idx + 1) % 100 == 0:
        print(f"Generated {idx + 1}/{TOTAL_NFTS} NFTs...")

print(f"\n✅ Successfully generated {TOTAL_NFTS} unique NFTs!")
print(f"Images: {OUTPUT_IMAGES_DIR}/")
print(f"Metadata: {OUTPUT_METADATA_DIR}/")
print(f"\nNext steps:")
print(f"1. Upload images and metadata to Arweave")
print(f"2. Update manifest with transaction IDs")
print(f"3. Update metadata image URLs with manifest TX ID")