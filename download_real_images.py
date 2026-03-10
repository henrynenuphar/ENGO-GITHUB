import urllib.request
import os
import ssl
import time

ssl._create_default_https_context = ssl._create_unverified_context

images = {
    "eiffel.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg",
    "kangaroo.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kangaroo_Australia_01_11_2008_-_retouch.JPG/800px-Kangaroo_Australia_01_11_2008_-_retouch.JPG",
    "bigben.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007.jpg/800px-Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007.jpg",
    "pyramids.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/800px-All_Gizah_Pyramids.jpg",
    "day_of_the_dead.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/D%C3%ADa_de_Muertos_en_Oaxaca.jpg/800px-D%C3%ADa_de_Muertos_en_Oaxaca.jpg",
    "one_pillar.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/One_Pillar_Pagoda_in_Hanoi.jpg/800px-One_Pillar_Pagoda_in_Hanoi.jpg"
}

output_dir = "public/assets/images/violympic"
os.makedirs(output_dir, exist_ok=True)

for filename, url in images.items():
    filepath = os.path.join(output_dir, filename)
    print(f"Downloading {filename} from {url}...")
    headers = {'User-Agent': 'ViolympicAppDL/1.0 (student@example.com)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Saved to {filepath}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
    time.sleep(1)
