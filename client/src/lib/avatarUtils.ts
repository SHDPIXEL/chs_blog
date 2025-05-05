/**
 * Extracts initials from a name
 * Example: "John Doe" -> "JD"
 */
export function getInitials(name?: string): string {
  if (!name || typeof name !== 'string') return '?';

  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Creates a data URL for an avatar with initials
 * @param name - The name to extract initials from
 * @returns A data URL string for the avatar
 */
export function createInitialsAvatar(name?: string): string {
  const safeName = name ?? '';
  const initials = getInitials(safeName);
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFC107', '#FF9800', '#FF5722', '#795548'
  ];

  // Generate a consistent color based on the name
  const colorIndex = safeName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  const context = canvas.getContext('2d');
  if (!context) return '';

  // Fill background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  context.fillStyle = 'white';
  context.font = 'bold 80px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initials, canvas.width / 2, canvas.height / 2);

  // Convert to data URL
  return canvas.toDataURL('image/png');
}
