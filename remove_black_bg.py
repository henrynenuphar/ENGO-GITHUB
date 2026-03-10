from PIL import Image

def remove_black_background(input_path, output_path, threshold=30):
    """
    Removes the black background from an image and makes it transparent.
    """
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is close to black
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change all near-black (also considering alpha) pixels to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import sys
    remove_black_background(sys.argv[1], sys.argv[2], threshold=50)
