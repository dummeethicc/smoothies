import json

# Read your current manifest
with open('manifest.json', 'r') as f:
    old_manifest = json.load(f)

# Create new manifest structure
new_manifest = {
    "manifest": "arweave/paths",
    "version": "0.2.0",
    "index": {"path": "0"},
    "paths": {}
}

# Convert all paths from "X.json" to "X"
for path, data in old_manifest['paths'].items():
    # Remove .json extension
    new_path = path.replace('.json', '')
    new_manifest['paths'][new_path] = data

# Write the new manifest
with open('manifest_updated.json', 'w') as f:
    json.dump(new_manifest, f, indent=2)

print(f"✅ Updated manifest created!")
print(f"Total paths: {len(new_manifest['paths'])}")
print(f"Paths now accessible without .json extension")
print(f"\nSave as: manifest_updated.json")
