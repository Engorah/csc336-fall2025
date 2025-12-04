import { useEffect, useState } from "react";
import "./Explore.css";

function Explore() {
  const [countries, setCountries] = useState([]);
  const [inspiration, setInspiration] = useState(null);
  const [error, setError] = useState(null);

  // Activities
  const activities = [
    "Try a local food market",
    "Explore a hidden beach",
    "Take a scenic train ride",
    "Visit a historic landmark",
    "Walk a famous street",
    "Try a sunrise hike",
    "Join a local festival",
    "Discover a street art district",
    "Take a cooking class",
    "Watch the sunset from a viewpoint",
  ];

  // Load countries
  useEffect(() => {
    fetch(
      "https://restcountries.com/v3.1/all?fields=name,capital,region,flags"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load countries");
        return res.json();
      })
      .then((data) => {
        const valid = data.filter(
          (c) => c.capital && Array.isArray(c.capital) && c.capital.length > 0
        );
        setCountries(valid);
      })
      .catch(() => setError("Could not load destinations."));
  }, []);

  async function generateInspiration() {
    if (!countries.length) {
      setError("Country list not loaded yet.");
      return;
    }

    setError(null);

    try {
      // Random destination
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];

      const city = randomCountry.capital[0];
      const countryName = randomCountry.name.common;
      const region = randomCountry.region;
      const flag = randomCountry.flags?.png;

      // Random local activity
      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)];

      // Random advice
      const adviceRes = await fetch("https://api.adviceslip.com/advice");
      const adviceData = await adviceRes.json();

      setInspiration({
        destination: { city, country: countryName, region, flag },
        activity: randomActivity,
        advice: adviceData.slip.advice,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate travel inspiration.");
    }
  }

  // Auto-generate once when countries load
  useEffect(() => {
    if (countries.length > 0) {
      generateInspiration();
    }
  }, [countries]);

  return (
    <div className="explore-container">
      <h1 className="explore-title">Travel Inspiration</h1>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {!inspiration ? (
        <p style={{ textAlign: "center" }}>Loading inspiration...</p>
      ) : (
        <div className="inspiration-card">
          <h2 className="destination-heading">
            ✈️ {inspiration.destination.city}, {inspiration.destination.country}
          </h2>
          <p className="region-text">
            Region: {inspiration.destination.region}
          </p>
          {inspiration.destination.flag && (
            <img
              src={inspiration.destination.flag}
              alt="Flag"
              className="flag-img"
            />
          )}
          <p className="activity-text">
            🌍 Activity: <strong>{inspiration.activity}</strong>
          </p>
          <p className="advice-text">
            “{inspiration.advice}”
          </p>
          <button
            className="generate-btn"
            onClick={generateInspiration}
          >
            Generate Another
          </button>
        </div>
      )}
    </div>
  );
}

export default Explore;