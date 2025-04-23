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

export function formatFirebaseTimestamp(createdAt) {
    if (!createdAt || typeof createdAt._seconds !== 'number') return '';

    const date = new Date(createdAt._seconds * 1000);
    return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function dateToFirebaseDate(dateString) {
    if (!dateString) return null;

    const parsedDate = new Date(Date.parse(dateString + ' GMT'));

    if (isNaN(parsedDate)) return null;

    return {
        _seconds: Math.floor(parsedDate.getTime() / 1000),
        _nanoseconds: 0,
    };
}

export function capitalizeString(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
