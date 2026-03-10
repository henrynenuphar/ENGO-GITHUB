from PIL import Image

def clean_goal(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    width, height = img.size

    newData = []
    for i, item in enumerate(datas):
        r, g, b, a = item
        y = i // width
        
        # Calculate luminance and color variance
        lum = 0.299*r + 0.587*g + 0.114*b
        avg = (r + g + b) / 3.0
        variance = abs(r - avg) + abs(g - avg) + abs(b - avg)
        
        alpha = 0
        
        # Goal net and posts are white/grey. White means high lum, low variance.
        # The green grass will have high variance.
        # The black shadows will have low lum.
        if lum > 60 and variance < 40:
            # Base alpha on luminance
            alpha = int(min(255, (lum - 60) * 2))
            
            # Soften edges based on variance
            if variance > 20:
                alpha = int(alpha * (1.0 - (variance - 20) / 20.0))
        
        # Gradual fade at the bottom to blend shadow/grass intersection into nothing
        fade_start = int(height * 0.88)
        if y > fade_start:
            fade = 1.0 - ((y - fade_start) / (height - fade_start))
            alpha = int(alpha * fade)
            
        newData.append((r, g, b, alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    clean_goal(sys.argv[1], sys.argv[2])
