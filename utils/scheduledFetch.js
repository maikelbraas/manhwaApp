import manhwaModel from '../models/Manhwa.js';
import genreModel from '../models/Genre.js';
import manhwaCheckReaper from './manhwaCheckReaper.js';
import manhwaCheckReaperUpdate from './manhwaCheckReaperUpdate.js';
import manhwaCheckFlame from './manhwaCheckFlame.js';
import manhwaCheckFlameUpdate from './manhwaCheckFlameUpdate.js';
import manhwaCheckSpecificUpdate from './manhwaCheckSpecificUpdate.js';
import genreCheck from './genreCheck.js';
import buildJson from './buildJson.js';

export default async function scheduledFetch(req, res, next, hostname) {
    console.log('Start scheduled update at: ' + new Date());
    let manhwasReaperUpdate = await manhwaCheckReaperUpdate(req, res, next);
    if (manhwasReaperUpdate.length > 0) {
        for (let manhwa of manhwasReaperUpdate) {
            await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);
            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
    }
    // let manhwasFlame = [];
    let manhwasFlameUpdate = await manhwaCheckFlameUpdate(req, res, next);
    if (manhwasFlameUpdate.length > 0) {
        for (let manhwa of manhwasFlameUpdate) {
            await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);
            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
    }
    let savedDemonManhwa = await manhwaModel.getDemonManhwa();
    let manhwasDemonUpdate = await manhwaCheckSpecificUpdate(req, res, next, savedDemonManhwa);
    if (manhwasDemonUpdate.length > 0) {
        for (let manhwa of manhwasDemonUpdate) {
            await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);
            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
    }

    let manhwasReaper = await manhwaCheckReaper(req, res, next);
    // let manhwasReaper = [];
    if (manhwasReaper.length > 0) {
        for (let manhwa of manhwasReaper) {
            let image = await downloadImage(manhwa.mid, manhwa.image);
            await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);
            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
    }
    let manhwasFlame = await manhwaCheckFlame(req, res, next);
    // console.log(manhwasReaper);
    if (manhwasFlame.length > 0) {
        for (let manhwa of manhwasFlame) {
            let image = await downloadImage(manhwa.mid, manhwa.image);
            await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);
            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
    }
    await fetch(hostname + '/api/jsonWrite');
    console.log('Finished scheduled update at: ' + new Date())
    return;
}
