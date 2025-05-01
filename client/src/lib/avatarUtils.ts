// Function to generate initials from a name
export function getInitials(name: string): string {
  if (!name) return '??';
  
  // Split the name by spaces
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // For single names, return the first two characters if available, otherwise just the first
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  } else {
    // For multiple names, take the first character of the first and last parts
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

// Function to generate a consistent color based on a name
export function getAvatarColor(name: string): string {
  // Array of vibrant colors for avatars
  const colors = [
    '#FF5630', // Coral Red
    '#00B8D9', // Cerulean Blue
    '#36B37E', // Green
    '#6554C0', // Purple
    '#FFAB00', // Amber
    '#FF7452', // Orange
    '#0065FF', // Blue
    '#8777D9', // Light Purple
    '#00875A', // Deep Green
    '#DE350B', // Red
    '#00A3BF', // Teal
    '#5243AA', // Deep Purple
    '#FF8B00', // Dark Orange
    '#008DA6', // Dark Cyan
    '#FFC400', // Yellow
  ];
  
  // Create a hash from the name string
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to an index within the colors array
  const index = Math.abs(hash % colors.length);
  
  return colors[index];
}

// Function to create an SVG data URL for an avatar with initials
export function createInitialsAvatar(name: string): string {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  
  // Create SVG content
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}" />
      <text 
        x="20" 
        y="20" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  // Convert to a data URL
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}