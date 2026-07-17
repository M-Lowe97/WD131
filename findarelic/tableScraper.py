import os
import json
import requests
from bs4 import BeautifulSoup

URL = "https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html"

print("Downloading live Warframe drop tables...")
response = requests.get(URL)

print("Parsing rapidly with html.parser (this should only take a moment)...")
# 'lxml' is written in C and is roughly 10x faster than the default python parser
soup = BeautifulSoup(response.content, 'html.parser')

js_mission_rewards = []
js_relic_rewards = []

PLANETS = ["Mercury", "Venus", "Earth", "Mars", "Phobos", "Ceres", "Jupiter", 
           "Europa", "Saturn", "Uranus", "Neptune", "Pluto", "Sedna", "Void", 
           "Lua", "Kuva Fortress", "Zariman", "Duviri", "Sanctum Anatomica"]

def extract_raw_percentage(drop_chance_text):
    if '(' in drop_chance_text:
        return drop_chance_text.split('(')[-1].replace(')', '').strip()
    return drop_chance_text.strip()

# Target just the core layout rows instead of everything on the page
all_rows = soup.find_all('tr')

current_section = None
planet, mission, mode = "Unknown", "Unknown", "Unknown"
current_rotation = "None"
relic_name = "Unknown"

current_mission_block = []
has_non_relic = False

def flush_mission_block():
    global current_mission_block, has_non_relic
    for entry in current_mission_block:
        entry["has_non_relic_in_section"] = has_non_relic
        js_mission_rewards.append(entry)
    current_mission_block = []
    has_non_relic = False

print("Processing data rows chronologically...")
row_count = 0
current_section = None

# Track both h3 section headers and rows in a single chronological sweep
all_elements = soup.find_all(['h3', 'tr'])

for element in all_elements:
    # If we hit an h3 heading element, switch the active section context immediately
    if element.name == 'h3':
        h3_id = element.get('id', '')
        if h3_id == 'missionRewards':
            current_section = 'missions'
            print(" -> [Section Entered] Mission Rewards")
        elif h3_id == 'relicRewards':
            if current_section == 'missions':
                flush_mission_block()
            current_section = 'relics'
            print(" -> [Section Entered] Relic Rewards")
        else:
            if current_section == 'missions':
                flush_mission_block()
            current_section = 'other'
        continue

    # If it's a row, process it based on our current section
    if element.name == 'tr':
        if current_section not in ['missions', 'relics']:
            continue
            
        row_count += 1
        if row_count % 10000 == 0:
            print(f"    Scanned {row_count} data rows...")

        strings = list(element.stripped_strings)
        if not strings:
            continue
        
        row_text = strings[0]

# --- PROCESS MISSIONS ---
        if current_section == 'missions':
            # Check for new mission header
            if any(p in row_text for p in PLANETS) and "(" in row_text:
                # NEW FILTER: Skip if 'Event' is in the planet/header string
                if "Event" in row_text:
                    # Clear variables to ensure we don't process this block
                    planet, mission, mode = "Event", "Event", "Event"
                    continue
                
                flush_mission_block()
                planet, mission, mode = "Unknown", "Unknown", "Unknown"
                current_rotation = "None"
                
                # ... (rest of your existing header parsing logic)
                if "/" in row_text:
                    parts = row_text.split("/")
                    planet = parts[0].strip()
                    if "(" in parts[1]:
                        mission = parts[1].split("(")[0].strip()
                        mode = parts[1].split("(")[1].replace(")", "").strip()
                else:
                    planet = row_text.split("(")[0].strip()
                    mission = planet
                    mode = row_text.split("(")[1].replace(")", "").strip()
                continue

            # Skip processing if we are currently inside an 'Event' block
            if planet == "Event":
                continue

            if "Rotation" in row_text:
                current_rotation = row_text
                continue

            if len(strings) >= 2:
                item_name = strings[0]
                drop_chance = strings[1]
                
                is_relic = "Relic" in item_name
                if not is_relic:
                    has_non_relic = True
                    
                if is_relic:
                    current_mission_block.append({
                        "planet": planet,
                        "mission": mission,
                        "game_mode": mode,
                        "reward": item_name,
                        "rotation": current_rotation,
                        "drop_chance": extract_raw_percentage(drop_chance),
                        "has_non_relic_in_section": False
                    })

        # --- PROCESS RELICS ---
        elif current_section == 'relics':
            if "Relic" in row_text and "(" in row_text and len(strings) == 1:
                relic_name = row_text
                continue
                
            if len(strings) >= 2:
                item_name = strings[0]
                drop_chance = strings[1]
                
                js_relic_rewards.append({
                    "relic": relic_name,
                    "reward": item_name,
                    "drop_chance": extract_raw_percentage(drop_chance)
                })

flush_mission_block()
print(f"\nProcessing complete. Total rows handled: {row_count}")

# --- SAFE DIRECTORY EXPORT ---
# --- SAFE DIRECTORY EXPORT (AUTO-MINIFIED) ---
# separators=(',', ':') strips out all formatting spaces and newlines from the JSON payload
minified_missions = json.dumps(js_mission_rewards, separators=(',', ':'))
minified_relics = json.dumps(js_relic_rewards, separators=(',', ':'))

# Format it as a single-line string per export
output_content = f"const missionRewardsData = {minified_missions};\nconst relicRewardsData = {minified_relics};\n"

script_directory = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_directory, "warframeSearchData.js")

with open(output_path, "w", encoding="utf-8") as f:
    f.write(output_content)

print(f"\nDone! Minified data saved securely to: {output_path}")