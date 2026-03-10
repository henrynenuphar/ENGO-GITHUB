const { Jimp } = require('jimp');

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

        await image.write(outputPath);
        console.log(`Saved transparent image to ${outputPath}`);
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

(async () => {
    // 3D Ball
    await removeBlackBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/glossy_soccer_ball_1770974938916.png',
        '/Volumes/henry/ENGO/src/assets/images/glossy_soccer_ball.png'
    );
    // Jumbotron
    await removeBlackBg(
        '/Users/henry/.gemini/antigravity/brain/90654aea-48c9-4938-b0a9-a425aa624832/jumbotron_board_1770974955834.png',
        '/Volumes/henry/ENGO/src/assets/images/jumbotron_board.png'
    );
})();
