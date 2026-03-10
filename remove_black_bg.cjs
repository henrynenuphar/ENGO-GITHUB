const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function removeBlackBg(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is very dark (black background)
            if (red < 20 && green < 20 && blue < 20) {
                this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
            }
        });

        await image.writeAsync(outputPath);
        console.log(`Saved transparent image to ${outputPath}`);
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

// Run for both Goal and Ball
(async () => {
    await removeBlackBg('/Volumes/henry/ENGO/src/assets/images/soccer_goal_3d_raw.png', '/Volumes/henry/ENGO/src/assets/images/soccer_goal_3d.png');
    await removeBlackBg('/Volumes/henry/ENGO/src/assets/images/soccer_ball_3d_raw.png', '/Volumes/henry/ENGO/src/assets/images/soccer_ball_3d.png');
})();
