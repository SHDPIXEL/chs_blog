/**
 * Extracts initials from a name
 * Examples:
 * - "Sarah Johnson" → "SJ"
 * - "Priya Sharma" → "PS"
 * - "John" → "J"
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'A';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);  // Limit to 2 characters
}

/**
 * Generates a deterministic color based on the name
 */
export function getAvatarColor(name: string): string {
  // List of pleasant background colors for avatars
  const colors = [
    '#F87171', // red
    '#FB923C', // orange
    '#FBBF24', // amber
    '#A3E635', // lime
    '#34D399', // emerald
    '#22D3EE', // cyan
    '#60A5FA', // blue
    '#A78BFA', // violet
    '#F472B6', // pink
  ];
  
  // Create a simple hash from the name for deterministic color selection
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Generates an SVG data URL with initials for use as avatar background
 */
export function createInitialsAvatar(name: string): string {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  
  // Create an SVG with the initials and background color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text 
        x="50" 
        y="50" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  // Convert the SVG to a data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}