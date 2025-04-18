export function validatePhoneNumber(cellulare) {
    if (!cellulare) return false;

    const trimmed = cellulare.trim();
    const phoneRegex = /^\d{10,15}$/;

    return phoneRegex.test(trimmed);
}