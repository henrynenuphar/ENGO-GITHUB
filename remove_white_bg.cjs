const { Jimp } = require('jimp');

async function removeWhiteBg(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is white-ish (Standard for white background removal)
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
    // UI Banner
    await removeWhiteBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/ui_banner_blue_1770975232348.png',
        '/Volumes/henry/ENGO/src/assets/images/ui_banner_blue.png'
    );
    // UI Button
    await removeWhiteBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/ui_button_hexagon_1770975244521.png',
        '/Volumes/henry/ENGO/src/assets/images/ui_button_hexagon.png'
    );
    // Cartoon Ball
    await removeWhiteBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/cartoon_soccer_ball_1770975257608.png',
        '/Volumes/henry/ENGO/src/assets/images/cartoon_soccer_ball.png'
    );
})();
