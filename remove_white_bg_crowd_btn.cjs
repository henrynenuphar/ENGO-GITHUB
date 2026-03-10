const { Jimp } = require('jimp');

async function removeWhiteBg(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is white-ish
            if (red > 240 && green > 240 && blue > 240) {
                this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
            }
        });

        await image.write(outputPath);
        console.log(`Saved transparent image to ${outputPath}`);
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

(async () => {
    // Crowd
    await removeWhiteBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/crowd_silhouettes_1770975808399.png',
        '/Volumes/henry/ENGO/src/assets/images/crowd_silhouettes.png'
    );
    // Button Long
    await removeWhiteBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/ui_button_long_1770975822746.png',
        '/Volumes/henry/ENGO/src/assets/images/ui_button_long.png'
    );
})();
