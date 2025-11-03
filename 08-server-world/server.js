import express from "express";
import fs from "fs";

const app = express();

app.use(express.static("./public"));

app.use(express.json());

app.get("/world", async (req, res) => {
    const dataString = await fs.readFileSync("world.json", "utf-8");
    const dataObject = JSON.parse(dataString);
    res.json(dataObject);
});

app.post("/update", async (req, res) => {
    try {
        const { region, townName, population } = req.body;

        const worldData = fs.readFileSync("world.json", "utf-8");
        const world = JSON.parse(worldData);

        const targetRegion = world.regions.find(r => r.name === region);
        if (!targetRegion) {
        return res.status(404).json({ error: `Region '${region}' not found` });
        }

        const newTown = {
        name: townName,
        population: Number(population),
        notable_people: []
        };

        targetRegion.towns.push(newTown);

        fs.writeFileSync("world.json", JSON.stringify(world, null, 2));
        res.json(world);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while updating world.json" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));