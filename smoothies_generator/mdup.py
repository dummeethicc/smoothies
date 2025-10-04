import os
import json

# Define directories
input_dir = "/Users/cameronmeek/smoothies-site/smoothies_generator/output_metadata"  # Replace with your metadata folder path
output_dir = "/Users/cameronmeek/smoothies-site/smoothies_generator/output_metadata2"  # Replace with your output folder path (optional)

# Ensure output directory exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Old and new URL prefixes
old_prefix = "ar://future-manifest-id/"
new_prefix = "https://img_smoothies.arweave.net/"

# Iterate through all files in the input directory
for filename in os.listdir(input_dir):
    if filename.endswith(".json"):
        file_path = os.path.join(input_dir, filename)
        
        # Read the JSON file
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Update the image URL
        if 'image' in data and data['image'].startswith(old_prefix):
            data['image'] = data['image'].replace(old_prefix, new_prefix)
        
        # Write the updated JSON to the output directory
        output_path = os.path.join(output_dir, filename)
        with open(output_path, 'w') as file:
            json.dump(data, file, indent=2)
        
        print(f"Updated {filename}")

print("Bulk update complete!")
