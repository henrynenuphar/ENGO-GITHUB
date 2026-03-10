from PIL import Image
import colorsys

def perfect_clean(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    width, height = img.size
    
    newData = []
    
    # We will be very strict: The goal is white. 
    # Any pixel that is not bright white/light-grey is removed.
    
    for i, item in enumerate(datas):
        r, g, b, a = item
        
        # Calculate luminance
        lum = 0.299*r + 0.587*g + 0.114*b
        
        # Calculate color saturation / difference
        val_max = max(r, g, b)
        val_min = min(r, g, b)
        diff = val_max - val_min
        
        # 1. Must be bright (lum > 140)
        # 2. Must be colorless/grey (diff < 30)
        # 3. Must not have a strong green/brown tint
        
        if lum > 130 and diff < 30 and g <= r + 15 and g <= b + 15:
            # It's a valid white/grey pixel of the goal
            # Add a slight alpha gradient for the darker greys to avoid jagged edges
            if lum < 200:
                alpha = int((lum - 130) / 70 * 255)
                newData.append((r, g, b, alpha))
            else:
                newData.append((r, g, b, 255))
        else:
            # Everything else (shadows, grass, dark netting, green spill) gets removed
            newData.append((255, 255, 255, 0))

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    perfect_clean(sys.argv[1], sys.argv[2])
