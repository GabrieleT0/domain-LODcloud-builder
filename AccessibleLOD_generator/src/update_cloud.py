import csv
import json
import requests
import os

def read_kg_ids_from_csv(csv_file):
    """
    Read KG IDs from CSV file.
    
    Args:
        csv_file: Path to the CSV file
    
    Returns:
        set: Set of KG IDs from the CSV
    """
    kg_ids = set()
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            kg_ids.add(row['KG'])
    
    return kg_ids

def download_json(url):
    """
    Download JSON file from URL.
    
    Args:
        url: URL of the JSON file
    
    Returns:
        dict: Parsed JSON data
    """
    print(f"Downloading JSON from {url}...")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()  # Raise an error for bad status codes
        
        data = response.json()
        print("JSON downloaded successfully!")
        return data
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading JSON: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        raise

def filter_json_by_kg_ids(json_data, kg_ids,output_file):
    """
    Filter JSON data to keep only keys that match KG IDs from CSV.
    
    Args:
        json_data: The JSON data (dict)
        kg_ids: Set of KG IDs to keep
    """
    # Filter the JSON data
    if isinstance(json_data, dict):
        filtered_data = {key: value for key, value in json_data.items() if key in kg_ids}
    else:
        raise ValueError("JSON data must be a dictionary/object at the root level")
    
    print(f"Original keys: {len(json_data)}")
    print(f"Filtered keys: {len(filtered_data)}")
    print(f"Keys removed: {len(json_data) - len(filtered_data)}")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=4)
        print(f"Filtered JSON data saved to {output_file}")
    
    return filtered_data

def prepare_data_for_webapp(filtered_data):
    lodcloud_data_list = []
    # Create a list of dictionaries
    for key in filtered_data:
        item = filtered_data[key]
        if '_id' in item and item['_id'] == '':
            item['_id'] = item['identifier']
        lodcloud_data_list.append(filtered_data[key])

    absolute_path = os.path.abspath(os.path.join('..','..','WebApp/backend/'))
    with open(absolute_path + '/AccessibleLOD_data.json', 'w') as f:
        json.dump(lodcloud_data_list, f, indent=4)

def main():
    # File paths and URL
    csv_file = '../data/accessiblelod.csv'  # Your CSV file
    json_url = 'https://lod-cloud.net/versions/latest/lod-data.json'  # Replace with actual URL
    output_file = '../data/AccessibleLOD_data.json'  # Output JSON file
    
    # Read KG IDs from CSV
    print(f"Reading KG IDs from {csv_file}...")
    kg_ids = read_kg_ids_from_csv(csv_file)
    print(f"Found {len(kg_ids)} KG IDs")
    print(f"KG IDs: {sorted(list(kg_ids))[:5]}..." if len(kg_ids) > 5 else f"KG IDs: {sorted(list(kg_ids))}")
    
    # Download JSON from web
    print(f"\nDownloading JSON from URL...")
    json_data = download_json(json_url)
    
    # Filter JSON data
    print(f"\nFiltering JSON data...")
    filtered_data = filter_json_by_kg_ids(json_data, kg_ids, output_file)

    # Prapre and move data for web app and 
    prepare_data_for_webapp(filtered_data)

if __name__ == '__main__':
    main()
