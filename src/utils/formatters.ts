// Date Formatting
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString();
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Role Badge Colors
export const getRoleBadgeColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    staff: 'bg-blue-100 text-blue-800',
    doctor: 'bg-green-100 text-green-800',
    nurse: 'bg-teal-100 text-teal-800',
  };
  
  return colors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// User Status Badge
export const getUserStatusBadge = (isActive: boolean, isSuspended: boolean) => {
  if (isSuspended) {
    return { text: 'Suspended', className: 'bg-red-100 text-red-800' };
  }
  if (isActive) {
    return { text: 'Active', className: 'bg-green-100 text-green-800' };
  }
  return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
};
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format Number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GH').format(num);
};

// Get Stock Status Badge
export const getStockStatusBadge = (quantity: number, isLowStock: boolean) => {
  if (quantity === 0) {
    return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
  }
  if (isLowStock) {
    return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
  }
  return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
};

// Get Published Status Badge
export const getPublishedStatusBadge = (isPublished: boolean) => {
  if (isPublished) {
    return { text: 'Published', className: 'bg-blue-100 text-blue-800' };
  }
  return { text: 'Draft', className: 'bg-gray-100 text-gray-800' };
};
// Get Initials from Name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};