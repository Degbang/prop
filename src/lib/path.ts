export const BASE = import.meta.env.BASE_URL;               // '/' in dev, '/prop/' on Pages
export const photoPath = (n: number) => `${BASE}images/${n}.jpg`;
export const PHOTOS = Array.from({ length: 8 }, (_, i) => photoPath(i + 1));
export const SONG = `${BASE}audio/song.mp3`;
