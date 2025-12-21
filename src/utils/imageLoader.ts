// Автоматически импортируем все изображения из папки assets и подпапок
const requireContext = require.context('../assets', true, /\.(png|jpe?g|gif|svg|webp)$/i);

const images: { [key: string]: string } = {};

requireContext.keys().forEach((key: string) => {
  // Убираем './' из начала пути
  const filename = key.replace('./', '');
  images[filename] = requireContext(key);
  
  // Также создаем ключ с ведущим слешем для путей из JSON
  const filenameWithSlash = '/' + filename;
  images[filenameWithSlash] = requireContext(key);
});

export const getImagePath = (filename: string): string => {
  return images[filename] || filename;
};

export default images;
