const { Jimp } = require('jimp');

async function removeGreenBg(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is GREEN (Bright green key)
            // Target: approx rgb(0, 255, 0)
            // Stricter tollerance for high quality
            if (green > 200 && red < 100 && blue < 100) {
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
    // Goal (Sharp Green Screen)
    await removeGreenBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/soccer_goal_sharp_green_1770978090817.png',
        '/Volumes/henry/ENGO/src/assets/images/soccer_goal_sharp.png'
    );
})();
