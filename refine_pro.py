from PIL import Image

def refine_pro(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    width, height = img.size

    newData = []
    
    # We will remove ALL dark pixels (shadows) completely.
    # We will also make sure the bottom edge smoothly fades out to avoid hard cuts.
    
    for i, item in enumerate(datas):
        r, g, b, a = item
        y = i // width
        
        # If the pixel is already transparent, keep it that way
        if a < 10:
            newData.append((0, 0, 0, 0))
            continue
            
        # Calculate luminance
        lum = 0.299*r + 0.587*g + 0.114*b
        
        # If it's a dark pixel (shadow, black line, dark green), remove it!
        # The goal is white/light-gray, so lum > 150 is typical.
        if lum < 100:
            newData.append((0, 0, 0, 0))
            continue
            
        # For mid-tones (100 - 160), make them partially transparent
        if lum < 160:
            new_a = int(a * ((lum - 100) / 60.0))
            newData.append((r, g, b, new_a))
        else:
            # Bright white pixels are kept with their original alpha
            newData.append((r, g, b, a))

    img.putdata(newData)
    
    # Optional: crop the bottom just in case there's weird stuff at the very edge 
    # (Since the goal posts should hit the ground, we don't hard crop, we just rely on lum)

    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    refine_pro(sys.argv[1], sys.argv[2])
