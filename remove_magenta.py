from PIL import Image

def remove_magenta(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # The generated image has a pure magenta background #FF00FF (r=255, g=0, b=255)
    # We will key out anything that is magenta or pink-ish
    # Magenta usually has high red, high blue, and low green.

    newData = []
    
    for item in datas:
        r, g, b, a = item
        
        # Check if it's magenta
        # High R and B, low G
        if r > 150 and b > 150 and g < 100:
            # It's the background magenta color, remove it perfectly
            newData.append((255, 255, 255, 0))
        elif r > 200 and b > 200 and g < 150:
            newData.append((255, 255, 255, 0))
        else:
            # We also might want to clean up slight magenta fringing (anti-aliasing)
            # If the pixel is mostly white/grey but has a magenta tint, desaturate it
            if r > g * 1.2 and b > g * 1.2:
                # Magenta fringe found! Let's convert it to neutral grey based on its green level
                # Green is the least affected component by magenta, so we use it as luminance
                newData.append((g, g, g, a))
            else:
                newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    remove_magenta(sys.argv[1], sys.argv[2])
