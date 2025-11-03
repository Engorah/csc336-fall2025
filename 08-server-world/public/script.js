async function loadWorld() {
    const res = await fetch("/world");
    const data = await res.json();

    let html = "";
    data.regions.forEach(region => {
        html += `<h3>${region.name} (${region.climate})</h3><ul>`;
        region.towns.forEach(town => {
            html += `<li><strong>${town.name}</strong> — Pop: ${town.population}<ul>`;
            town.notable_people.forEach(person => {
                html += `<li>${person.name} (${person.role})</li>`;
            });
            html += `</ul></li>`;
        });
        html += `</ul>`;
    });

    document.getElementById("worldDiv").innerHTML = html;
}

loadWorld();

let updateForm = document.querySelector("#updateForm");

updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let formData = new FormData(updateForm);
    let formDataObject = Object.fromEntries(formData.entries());

    const res = await fetch("/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObject)
    });

    const updatedWorld = await res.json();
    console.log("World updated:", updatedWorld);
    loadWorld();
});