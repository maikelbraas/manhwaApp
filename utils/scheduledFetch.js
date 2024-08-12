import manhwaModel from '../models/Manhwa.js';
import manhwaCheck from './manhwaCheck.js';
import manhwaCheckUpdate from './manhwaCheckUpdate.js';
import genreCheck from './genreCheck.js';
import downloadImage from './downloadImage.js';
import resizeImages from './resizeImages.js';

export default async function scheduledFetch(req, res, next, hostname) {
    console.log('Start scheduled update at: ' + new Date());

    let sources = [{ baseurl: 'https://reaper-scans.com/', name: 'reaper' }, { baseurl: 'https://flamecomics.me/', name: 'flame' }];
    let totalCreated = 0;
    for (let source of sources) {
        let manhwasCreate = await manhwaCheck(req, res, next, source.baseurl, source.name);
        totalCreated += manhwasCreate.length;
        if (manhwasCreate.length > 0) {
            for (let manhwa of manhwasCreate) {
                let image = await downloadImage(manhwa.mid, manhwa.image);
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
            }
            for (let manhwaResize of manhwasCreate) {
                await resizeImages(manhwaResize.mid, { width: 150, height: 225 });
                await resizeImages(manhwaResize.mid, { width: 100, height: 150 });
            }
        }
    }

    let nameSources = ['reaper', 'flame', 'mgdemon'];
    let totalUpdated = 0;
    for (let source of nameSources) {
        let updates = await manhwaCheckUpdate(req, res, next, source);
        if (updates.length > 0) {
            for (let manhwa of updates) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        totalUpdated += updates.length;
    }

    await fetch(hostname + '/api/jsonWrite');
    console.log('Finished scheduled update at: ' + new Date())
    console.log(`Total created: ${totalCreated}
Total updated: ${totalUpdated}`)
    return;
}
