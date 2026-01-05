import { randomInt } from "crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford Base32
const ID_LENGTH = 5;

export const generateShortId = (idLength: number = ID_LENGTH): string =>
    Array.from(
        { length: idLength },
        () => ALPHABET[randomInt(0, ALPHABET.length)]
    ).join("");
