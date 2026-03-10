from PIL import Image

def clean_goal(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    width, height = img.size
    
    # Calculate crop threshold (remove bottom 5%)
    bottom_cut = int(height * 0.95)

    for i, item in enumerate(datas):
        r, g, b, a = item
        y = i // width
        
        if y > bottom_cut:
            newData.append((255, 255, 255, 0))
            continue
            
        # Calculate luminance
        lum = 0.299*r + 0.587*g + 0.114*b
        
        # Calculate color saturation / difference
        val_max = max(r, g, b)
        val_min = min(r, g, b)
        diff = val_max - val_min
        
        # Keep if it's bright AND colorless (white/grey)
        if lum > 120 and diff < 40:
            # Add some anti-aliasing / soft edge for darker greys
            if lum < 180:
                alpha = int((lum - 120) / 60 * 255)
                newData.append((r, g, b, alpha))
            else:
                newData.append((r, g, b, a))
        else:
            newData.append((255, 255, 255, 0))

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    clean_goal(sys.argv[1], sys.argv[2])
