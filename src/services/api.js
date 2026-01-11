// API Service для интеграции с бекендом

const API_URL = '/api';

/**
 * Получить все работы
 */
export const getArtworks = async () => {
  try {
    const response = await fetch(`${API_URL}/artworks`);
    if (!response.ok) {
      throw new Error('Failed to fetch artworks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
};

/**
 * Получить одну работу по ID
 */
export const getArtwork = async (id) => {
  try {
    const response = await fetch(`${API_URL}/artworks/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artwork');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }
};

/**
 * Получить информацию "О художнике"
 */
export const getAboutInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/about`);
    if (!response.ok) {
      throw new Error('Failed to fetch about info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching about info:', error);
    return null;
  }
};

/**
 * Получить работы по категории
 */
export const getArtworksByCategory = async (category) => {
  try {
    const artworks = await getArtworks();
    if (category === 'Все' || !category) {
      return artworks;
    }
    return artworks.filter(artwork => artwork.category === category);
  } catch (error) {
    console.error('Error filtering artworks:', error);
    return [];
  }
};
