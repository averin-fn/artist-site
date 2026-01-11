// API Configuration
const API_URL = 'http://localhost:3001/api';
let authToken = localStorage.getItem('authToken');

// Utility Functions
function setAuthToken(token) {
  authToken = token;
  localStorage.setItem('authToken', token);
}

function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('authToken');
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (response.status === 401) {
    clearAuthToken();
    showLoginScreen();
    throw new Error('Необходима авторизация');
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data;
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  try {
    errorEl.textContent = '';
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    setAuthToken(data.token);
    showDashboard();
    loadArtworks();
  } catch (error) {
    errorEl.textContent = error.message;
  }
});

// Logout
function logout() {
  clearAuthToken();
  showLoginScreen();
}

// Screen Management
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'block';
}

function showTab(tabName) {
  document.getElementById('artworksTab').style.display = tabName === 'artworks' ? 'block' : 'none';
  document.getElementById('aboutTab').style.display = tabName === 'about' ? 'block' : 'none';

  if (tabName === 'artworks') {
    loadArtworks();
  } else if (tabName === 'about') {
    loadAboutInfo();
  }
}

// Artworks Management
let currentArtworks = [];
let editingArtworkId = null;

async function loadArtworks() {
  try {
    currentArtworks = await apiRequest('/artworks');
    displayArtworks();
  } catch (error) {
    console.error('Error loading artworks:', error);
  }
}

// Функция для экранирования HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function displayArtworks() {
  const container = document.getElementById('artworksList');
  
  if (currentArtworks.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Пока нет работ</p>';
    return;
  }

  container.innerHTML = currentArtworks.map(artwork => `
    <div class="artwork-card">
      <img src="${escapeHtml(artwork.images && artwork.images.length > 0 ? artwork.images[0] : '/placeholder.jpg')}" 
           alt="${escapeHtml(artwork.title)}"
           onerror="this.src='/placeholder.jpg'">
      <div class="artwork-card-content">
        <h3>${escapeHtml(artwork.title)}</h3>
        <p><strong>Категория:</strong> ${escapeHtml(artwork.category)}</p>
        ${artwork.price ? `<p><strong>Цена:</strong> ${artwork.price} ₽</p>` : ''}
        ${artwork.year ? `<p><strong>Год:</strong> ${artwork.year}</p>` : ''}
      </div>
      <div class="artwork-card-actions">
        <button class="btn btn-secondary" onclick="editArtwork(${artwork.id})">Редактировать</button>
        <button class="btn btn-danger" onclick="deleteArtwork(${artwork.id})">Удалить</button>
      </div>
    </div>
  `).join('');
}

function showArtworkModal(artworkId = null) {
  editingArtworkId = artworkId;
  const modal = document.getElementById('artworkModal');
  const form = document.getElementById('artworkForm');
  
  form.reset();
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('artworkImagePaths').value = '';
  
  if (artworkId) {
    document.getElementById('modalTitle').textContent = 'Редактировать работу';
    const artwork = currentArtworks.find(a => a.id === artworkId);
    
    if (artwork) {
      document.getElementById('artworkId').value = artwork.id;
      document.getElementById('artworkTitle').value = artwork.title;
      document.getElementById('artworkCategory').value = artwork.category;
      document.getElementById('artworkDescription').value = artwork.description || '';
      document.getElementById('artworkPrice').value = artwork.price || '';
      document.getElementById('artworkYear').value = artwork.year || '';
      document.getElementById('artworkMedium').value = artwork.medium || '';
      document.getElementById('artworkSize').value = artwork.size || '';
      
      if (artwork.images && artwork.images.length > 0) {
        document.getElementById('artworkImagePaths').value = JSON.stringify(artwork.images);
        displayExistingImages(artwork.images);
      }
    }
  } else {
    document.getElementById('modalTitle').textContent = 'Добавить работу';
    document.getElementById('artworkId').value = '';
  }
  
  modal.style.display = 'block';
}

function closeArtworkModal() {
  document.getElementById('artworkModal').style.display = 'none';
  editingArtworkId = null;
}

function displayExistingImages(images) {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = images.map((img, index) => `
    <div class="image-preview-item">
      <img src="${img}" alt="Image ${index + 1}">
      <button type="button" class="remove-image" onclick="removeExistingImage(${index})">×</button>
    </div>
  `).join('');
}

function removeExistingImage(index) {
  const imagesInput = document.getElementById('artworkImagePaths');
  const images = JSON.parse(imagesInput.value || '[]');
  images.splice(index, 1);
  imagesInput.value = JSON.stringify(images);
  displayExistingImages(images);
}

// Handle image upload preview
document.getElementById('artworkImages')?.addEventListener('change', async function(e) {
  const files = Array.from(e.target.files);
  const preview = document.getElementById('imagePreview');
  
  if (files.length === 0) return;

  // Проверка размера файлов
  const maxSize = 10 * 1024 * 1024; // 10MB
  const invalidFiles = files.filter(file => file.size > maxSize);
  if (invalidFiles.length > 0) {
    alert(`Файлы слишком большие (максимум 10MB): ${invalidFiles.map(f => f.name).join(', ')}`);
    e.target.value = '';
    return;
  }

  try {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      const existingImages = JSON.parse(document.getElementById('artworkImagePaths').value || '[]');
      const allImages = [...existingImages, ...data.paths];
      document.getElementById('artworkImagePaths').value = JSON.stringify(allImages);
      displayExistingImages(allImages);
      e.target.value = ''; // Очистить input
    } else {
      alert(data.error || 'Ошибка загрузки изображений');
      e.target.value = '';
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Ошибка загрузки изображений: ' + error.message);
    e.target.value = '';
  }
});

// Save artwork
document.getElementById('artworkForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const artworkId = document.getElementById('artworkId').value;
  const images = JSON.parse(document.getElementById('artworkImagePaths').value || '[]');

  const artworkData = {
    title: document.getElementById('artworkTitle').value,
    category: document.getElementById('artworkCategory').value,
    description: document.getElementById('artworkDescription').value,
    price: parseInt(document.getElementById('artworkPrice').value) || null,
    year: parseInt(document.getElementById('artworkYear').value) || null,
    medium: document.getElementById('artworkMedium').value,
    size: document.getElementById('artworkSize').value,
    images: images
  };

  try {
    if (artworkId) {
      await apiRequest(`/artworks/${artworkId}`, {
        method: 'PUT',
        body: JSON.stringify(artworkData)
      });
    } else {
      await apiRequest('/artworks', {
        method: 'POST',
        body: JSON.stringify(artworkData)
      });
    }

    closeArtworkModal();
    // Автообновление списка работ
    await loadArtworks();
    alert('Работа успешно сохранена!');
  } catch (error) {
    alert(error.message);
  }
});

function editArtwork(id) {
  showArtworkModal(id);
}

async function deleteArtwork(id) {
  if (!confirm('Вы уверены, что хотите удалить эту работу?')) {
    return;
  }

  try {
    await apiRequest(`/artworks/${id}`, { method: 'DELETE' });
    // Автообновление списка
    await loadArtworks();
    alert('Работа успешно удалена!');
  } catch (error) {
    alert(error.message);
  }
}

// About Info Management
let aboutGallery = [];

async function loadAboutInfo() {
  try {
    const data = await apiRequest('/about');
    
    document.getElementById('aboutTitle').value = data.title || '';
    document.getElementById('aboutName').value = data.name || '';
    document.getElementById('aboutBio').value = data.bio || '';
    document.getElementById('aboutExperience').value = data.experience || '';
    document.getElementById('aboutPhone').value = data.phone || '';
    document.getElementById('aboutEmail').value = data.email || '';
    document.getElementById('aboutVk').value = data.vk || '';
    document.getElementById('aboutInstagram').value = data.instagram || '';
    
    // Загружаем галерею
    aboutGallery = data.gallery || [];
    displayAboutGallery();
  } catch (error) {
    console.error('Error loading about info:', error);
  }
}

function displayAboutGallery() {
  const preview = document.getElementById('aboutGalleryPreview');
  if (!aboutGallery || aboutGallery.length === 0) {
    preview.innerHTML = '<p style="color: #7f8c8d;">Изображения галереи не загружены</p>';
    return;
  }
  
  preview.innerHTML = aboutGallery.map((img, index) => `
    <div class="image-preview-item">
      <img src="${img}" alt="Gallery ${index + 1}">
      <button type="button" class="remove-image" onclick="removeAboutGalleryImage(${index})">×</button>
    </div>
  `).join('');
}

function removeAboutGalleryImage(index) {
  aboutGallery.splice(index, 1);
  displayAboutGallery();
}

// Обработчик загрузки изображений для галереи
document.getElementById('aboutGalleryImages')?.addEventListener('change', async function(e) {
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;

  try {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      aboutGallery = [...aboutGallery, ...data.paths];
      displayAboutGallery();
      e.target.value = ''; // Очистить input
    } else {
      alert(data.error || 'Ошибка загрузки изображений');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Ошибка загрузки изображений');
  }
});

async function saveAbout() {
  const aboutData = {
    title: document.getElementById('aboutTitle').value,
    name: document.getElementById('aboutName').value,
    bio: document.getElementById('aboutBio').value,
    experience: document.getElementById('aboutExperience').value,
    phone: document.getElementById('aboutPhone').value,
    email: document.getElementById('aboutEmail').value,
    vk: document.getElementById('aboutVk').value,
    instagram: document.getElementById('aboutInstagram').value,
    gallery: aboutGallery // Теперь сохраняем галерею
  };

  try {
    await apiRequest('/about', {
      method: 'PUT',
      body: JSON.stringify(aboutData)
    });
    alert('Информация успешно сохранена!');
  } catch (error) {
    alert(error.message);
  }
}

// Close modal on outside click
window.onclick = function(event) {
  const modal = document.getElementById('artworkModal');
  if (event.target === modal) {
    closeArtworkModal();
  }
}

// Initialize
async function init() {
  if (authToken) {
    try {
      await apiRequest('/auth/verify');
      showDashboard();
      loadArtworks();
    } catch (error) {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

init();
