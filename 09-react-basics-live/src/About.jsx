import "./About.css";

function About () {
    return (
        <div className="about-container">
            <h1 className="about-title">About This App</h1>

            <div className="about-divider"></div>

            <p className="about-text">
                This travel planner lets you keep track of destinations you want to visit,
                mark important ones, and explore new places through fun inspiration tools.
            </p>

            <p className="about-subtext">
                Whether you're building your next vacation or dreaming of faraway cities,
                this app helps bring your wanderlust to life.
            </p>

            <p className="about-footer-note">
                ✈️ Made with React • Explore the world, one click at a time
            </p>
        </div>
    );
}

export default About;