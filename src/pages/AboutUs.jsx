import '../styles/about.css';
import ceo from '../img/dp.jpeg';
import HOO from '../img/asif.jpeg';
import TL from '../img/gibli.png';

const AboutUs = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About WorkConnect</h1>
        <p>Connecting skilled workers with people in need since 2023</p>
      </section>
      
      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          At WorkConnect, we believe in making it easy to find reliable, skilled professionals 
          for all your home service needs. Whether you need an electrician, plumber, carpenter, 
          or any other skilled worker, we've got you covered.
        </p>
      </section>
      
      <section className="team">
        <h2>Our Team</h2>
        <div className="team-members">
          <div className="member">
            <div className="member-image">
              <img src={ceo} alt="Danish" />
            </div>
            <h3> Danish</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="member">
          <div className="member-image">
              <img src={HOO} alt="Danish" />
            </div>
            <h3>Asif Jamil Ahemad</h3>
            <p>Head of Operations</p>
          </div>
          <div className="member">
            <div className="member-image">
              <img src={TL} alt="Danish" />
            </div>
            <h3> Infinity </h3>
            <p>Tech Lead</p>
          </div>
        </div>
      </section>
      
      <section className="stats">
        <h2>By The Numbers</h2>
        <div className="stat-cards">
          <div className="stat-card">
            <h3>500+</h3>
            <p>Skilled Workers</p>
          </div>
          <div className="stat-card">
            <h3>10,000+</h3>
            <p>Completed Jobs</p>
          </div>
          <div className="stat-card">
            <h3>95%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;