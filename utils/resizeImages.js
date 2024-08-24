import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function resizeImages(mid, size) {
    let imagename = mid;

    const dirImage = 'public/4Z017sNnvsPD/' + mid + '.webp';
    const dirPath = 'public/4Z017sNnvsPD/';
    let image;
    try {
        image = await sharp(dirImage)
            .resize({ width: size.width, height: size.height, fit: sharp.fit.fill, quality: 100, lossless: true })
            .toFormat("webp")
            .toBuffer(mid + '.webp');
    } catch (error) {
        console.log(error);
    }
    imagename = `${mid}-${size.width}x${size.height}.webp`;

    try {
        fs.writeFile(path.join(dirPath, imagename), image, (err) => {
            if (err)
                console.error(err);
        });
    } catch (err) {
        console.error(err);
    }
    return imagename;


}