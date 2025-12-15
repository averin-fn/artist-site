// Автоматически импортируем все изображения из папки assets
const requireContext = require.context('../assets', false, /\.(png|jpe?g|gif|svg|webp)$/i);

const images: { [key: string]: string } = {};

requireContext.keys().forEach((key: string) => {
  // Убираем './' из начала пути
  const filename = key.replace('./', '');
  images[filename] = requireContext(key);
});

export const getImagePath = (filename: string): string => {
  return images[filename] || filename;
};

export default images;
