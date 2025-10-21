import fs from "fs";

const data = fs.readFileSync('world.json', 'utf-8');

const world = JSON.parse(data);

for (const region of world.regions) {
    const town = region.towns[0];
    const person = town.notable_people[0];

    console.log(`\nRegion: ${region.name} (${region.climate})`);
    console.log(`Town: ${town.name} — Population: ${town.population}`);
    console.log(`Famous local: ${person.name}, ${person.role}`);
}
