import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function downloadImage(mid, url) {
    let imagename = mid;
    const dirPath = 'public/manhwaImages/';
    let image;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    try {
        image = await sharp(buffer)
            .resize({ width: 200, height: 300, fit: sharp.fit.fill })
            .toFormat("webp")
            .toBuffer(mid + '.webp');
    } catch (error) {
        console.log(error);
    }
    imagename = mid + '.webp'

    try {
        fs.writeFile(path.join(dirPath, imagename), image, (err) => {
            if (err)
                console.error(err);
            else {
                console.log('image downloaded');
            }
        });
    } catch (err) {
        console.error(err);
    }
    return imagename;


}