export function validatePhoneNumber(cellulare) {
    if (!cellulare) return false;

    const trimmed = cellulare.trim();
    const phoneRegex = /^\d{10,15}$/;

    return phoneRegex.test(trimmed);
}

export function breakLine(string) {
    if (!string || typeof string !== "string") return [string];

    const middleIndex = Math.floor(string.length / 2);
    const firstPart = string.slice(0, middleIndex).trim();
    const secondPart = string.slice(middleIndex).trim();

    return [firstPart, secondPart];
}