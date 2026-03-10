from PIL import Image
import sys

def auto_crop(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    # Get alpha channel for accurate bounding box
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        cropped_img = img.crop(bbox)
        cropped_img.save(output_path, "PNG")
        print("Cropped successfully to", bbox)
    else:
        print("No bounding box found.")

if __name__ == "__main__":
    auto_crop(sys.argv[1], sys.argv[2])
