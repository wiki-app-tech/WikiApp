import fs from 'fs/promises';
import path from 'path';

const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');

async function run() {
    const data = await fs.readFile(feedsPath, 'utf8');
    const feeds = JSON.parse(data);

    const migrated = feeds.map(feed => {
        let scope = 'nacional';
        let category = 'general';

        if (feed.category === 'internacional') {
            scope = 'internacional';
            category = 'general';
        } else if (feed.category === 'nacional') {
            scope = 'nacional';
            category = 'general';
        } else if (feed.category === 'provincial') {
            scope = 'provincial';
            category = 'general';
        } else if (feed.category === 'sociedad') {
            scope = 'nacional';
            category = 'general';
        } else if (feed.category === 'gremial') {
            if (feed.id === 'gremiales-del-sur') {
                scope = 'provincial';
            } else {
                scope = 'nacional';
            }
            category = 'gremial';
        } else if (feed.category === 'deporte') {
            scope = 'nacional';
            category = 'deportes';
        } else if (feed.category === 'religion') {
            scope = 'nacional';
            category = 'religion';
        } else if (feed.category === 'tecnologia') {
            if (feed.id === 'flacso-argentina') {
                scope = 'nacional';
                category = 'general';
            } else if (feed.id === 'noticias-de-criptomonedas') {
                scope = 'internacional';
                category = 'economia';
            } else {
                scope = 'internacional';
                category = 'tecnologia';
            }
        } else if (feed.category === 'economia') {
            scope = 'nacional';
            category = 'economia';
        } else if (feed.category === 'politica') {
            if (feed.id === 'economiapolitica-expansion-com') {
                scope = 'internacional';
                category = 'economia';
            } else {
                scope = 'nacional';
                category = 'general';
            }
        } else if (feed.category === 'otras') {
            if (feed.id === 'radio-nacional') {
                scope = 'provincial';
                category = 'general';
            } else {
                scope = 'internacional';
                category = 'general';
            }
        }

        // Specific overrides
        if (feed.id === 'legislatura-tdf-a-i-a-s' || feed.id === 'municipio-de-rio-grande') {
            scope = 'provincial';
            category = 'institucional';
        }
        if (feed.id === 'resumen-policial') {
            scope = 'provincial';
            category = 'policial';
        }

        return {
            id: feed.id,
            name: feed.name,
            url: feed.url,
            type: feed.type,
            scope,
            category
        };
    });

    await fs.writeFile(feedsPath, JSON.stringify(migrated, null, 4), 'utf8');
    console.log(`Migrated ${migrated.length} feeds successfully!`);
}

run().catch(console.error);
