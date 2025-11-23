import React from 'react';
import aboutData from '../config/about.json';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about">
      <div className="about-hero">
        <div className="about-content">
          <h2 className="about-title">{aboutData.name}</h2>
          <p className="about-bio">{aboutData.bio}</p>
          <p className="about-experience">{aboutData.experience}</p>
        </div>
      </div>

      <div className="about-specialization">
        <h3>Специализация</h3>
        <ul className="specialization-list">
          {aboutData.specialization.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="about-exhibitions">
        <h3>Выставки и достижения</h3>
        <div className="exhibitions-list">
          {aboutData.exhibitions.map((exhibition, index) => (
            <div key={index} className="exhibition-item">
              <h4>{exhibition.name}</h4>
              <p className="exhibition-year">{exhibition.year}</p>
              <p className="exhibition-description">{exhibition.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-contact">
        <h3>Контакты</h3>
        <div className="contact-info">
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${aboutData.contact.email}`}>
              {aboutData.contact.email}
            </a>
          </p>
          <p>
            <strong>Телефон:</strong>{' '}
            <a href={`tel:${aboutData.contact.phone}`}>{aboutData.contact.phone}</a>
          </p>
          <p>
            <strong>Instagram:</strong>{' '}
            <a href={aboutData.contact.instagram} target="_blank" rel="noopener noreferrer">
              Перейти на страницу
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
