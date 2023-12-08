import yaml
import json

def expand_shared_calculations(data, shared_calcs):
    for measure_name, measure_details in data.get('measures', {}).items():
        if isinstance(measure_details, dict) and 'use_shared' in measure_details:
            shared_calc_name = measure_details['use_shared']
            # Replace with the actual shared calculation content
            data['measures'][measure_name] = shared_calcs.get(shared_calc_name, {})
        elif isinstance(measure_details, dict) and 'calculate' in measure_details:
            # For each item in calculate list, replace 'use_shared' references
            data['measures'][measure_name]['calculate'] = [
                shared_calcs.get(item.split(": ")[1], item) if 'use_shared' in item else item 
                for item in measure_details['calculate']
            ]
    return data

def convert_yaml_to_json(yaml_file, json_file):
    with open(yaml_file, 'r') as file:
        yaml_content = yaml.safe_load(file)

    # Extract shared calculations
    shared_calcs = yaml_content.get('shared_calculations', {})

    # Expand shared calculations
    expanded_content = expand_shared_calculations(yaml_content, shared_calcs)

    # Extract only dimensions and measures
    extracted_content = {key: expanded_content[key] for key in ['dimensions', 'measures']}

    # Convert to JSON
    json_content = json.dumps(extracted_content, indent=4)

    with open(json_file, 'w') as json_out:
        json_out.write(json_content)

    print(f"Conversion complete. JSON saved to {json_file}")

convert_yaml_to_json('formula.yaml', 'formula.json')
