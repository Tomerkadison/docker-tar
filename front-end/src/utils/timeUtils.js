// Helper function to format relative time
export const getRelativeTime = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} day${diffDays==1 ? '':'s'} ago`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} month${Math.round(diffDays / 30) == 1 ? '':'s'} ago`;
    return `${Math.round(diffDays / 365)} year${Math.round(diffDays / 365) == 1 ? '':'s'} ago`;
};