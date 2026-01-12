import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getAboutInfo } from '../services/api';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  vk?: string;
  instagram?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const data = await getAboutInfo();
        if (data) {
          setContacts({
            phone: data.phone,
            email: data.email,
            vk: data.vk,
            instagram: data.instagram
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки контактов:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="compact-modal">
      <div className="contact-modal">
        <h2 className="contact-modal-title">Контакты для покупки</h2>
        <p className="contact-modal-description">
          Свяжитесь со мной любым удобным способом, чтобы обсудить детали покупки
        </p>
        {loading ? (
          <div className="contact-modal-loading">Загрузка...</div>
        ) : contacts ? (
          <div className="contact-modal-list">
            {contacts.phone && (
              <div className="contact-modal-item">
                <span className="contact-modal-label">Телефон:</span>
                <a href={`tel:${contacts.phone}`} className="contact-modal-value">
                  {contacts.phone}
                </a>
              </div>
            )}
            {contacts.email && (
              <div className="contact-modal-item">
                <span className="contact-modal-label">Email:</span>
                <a href={`mailto:${contacts.email}`} className="contact-modal-value">
                  {contacts.email}
                </a>
              </div>
            )}
            {contacts.vk && (
              <div className="contact-modal-item">
                <span className="contact-modal-label">ВКонтакте:</span>
                <a 
                  href={contacts.vk} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-modal-value"
                >
                  Написать в VK
                </a>
              </div>
            )}
            {contacts.instagram && (
              <div className="contact-modal-item">
                <span className="contact-modal-label">Instagram:</span>
                <a 
                  href={contacts.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-modal-value"
                >
                  Написать в Instagram
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="contact-modal-error">Ошибка загрузки контактов</div>
        )}
      </div>
    </Modal>
  );
};

export default ContactModal;
