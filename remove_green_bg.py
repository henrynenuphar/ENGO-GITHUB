from PIL import Image
import colorsys

def is_background(r, g, b, threshold_h=(0.15, 0.50), threshold_s=0.2, threshold_v=0.1):
    # Convert RGB to HSV ([0, 255] -> [0, 1])
    h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
    
    # Check if hue is in the green range and saturation/value are high enough
    if threshold_h[0] <= h <= threshold_h[1] and s > threshold_s and v > threshold_v:
        return True
        
    # Also remove very dark pixels (the noisy shadow artifacts at the bottom)
    if v < 0.25 and s < 0.5:
        return True
        
    # Remove dark green/brown noise
    if r < 80 and g < 100 and b < 80:
        return True
        
    return False

def remove_green_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        if is_background(r, g, b):
            # Change green pixels to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    remove_green_background(sys.argv[1], sys.argv[2])
