from PIL import Image
import colorsys
import math

def is_green(r, g, b, threshold=60):
    # Base green: r=0, g=255, b=0 but usually the generated background is around 3, 56, 3 (dark green)
    # Let's get the background color dynamically from the top-left pixel
    pass

def chroma_key(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    width, height = img.size
    
    # Get background color from top-left pixel (assumed to be pure bg)
    bg_r, bg_g, bg_b, _ = datas[0]
    
    # Bottom fade settings to remove ground shadows completely
    # The shadow starts around the bottom 15% of the image.
    bottom_cut_start = int(height * 0.85)

    newData = []
    for i, item in enumerate(datas):
        r, g, b, a = item
        y = i // width
        x = i % width
        
        # 1. Handle hard cut at the very bottom where shadows are
        if y > int(height * 0.95):
            newData.append((255, 255, 255, 0))
            continue
            
        # 1.5 Handle smooth fade for the cast shadow on the ground
        fade_alpha_mult = 1.0
        if y > bottom_cut_start:
            # Linear fade from 1 to 0 over the bottom section
            fade_alpha_mult = 1.0 - ((y - bottom_cut_start) / (height * 0.95 - bottom_cut_start))

        # 2. Distance from the background green color
        dist = math.sqrt((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)
        
        # 3. Keying logic
        if dist < 20:
            # Pure background
            newData.append((255, 255, 255, 0))
        elif dist < 80:
            # Transition edge (soft blending)
            alpha_edge = int((dist - 20) / 60 * 255)
            final_alpha = int(alpha_edge * fade_alpha_mult)
            newData.append((r, g, b, final_alpha))
        else:
            # Completely foreground (white goal posts and net)
            final_alpha = int(255 * fade_alpha_mult)
            newData.append((r, g, b, final_alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    chroma_key(sys.argv[1], sys.argv[2])
