// packages/server/src/utils/validation.ts
import {
    BookCondition,
    CreateBookInput,
    CreateTransactionInput,
    UpdateBookInput,
} from "@react-express-library/shared";

const isValidUrl = (urlString: string | null | undefined): boolean => {
    if (!urlString) return true; // It's optional, so null/undefined is valid
    try {
        new URL(urlString);
        return true;
    } catch (e) {
        return false;
    }
};

// --- Your existing (and perfect) Auth validation ---
export const isValiEmail = (email: string): string | null => {
    // ... (your existing logic)
    if (typeof email !== "string") {
        return "Invalid email format";
    }
    const atIndex = email.indexOf("@");
    const lastDotIndex = email.lastIndexOf(".");
    let hasAtSgn = false;
    let validCharsBeforeAt = false;
    let hasDot = false;
    let validCharsBetweenAtAndDot = false;
    let validCharactersAfterDot = false;
    if (atIndex >= 0) {
        hasAtSgn = true;
    }
    if (atIndex > 0) {
        validCharsBeforeAt = true;
    }
    if (lastDotIndex >= 0 && lastDotIndex > atIndex) {
        hasDot = true;
    }
    if (lastDotIndex > atIndex + 1) {
        validCharsBetweenAtAndDot = true;
    }
    if (lastDotIndex < email.length - 1) {
        validCharactersAfterDot = true;
    }
    if (!hasAtSgn)
        return "Email must contain '@' symbol and it cannot be the first character.";
    if (!validCharsBeforeAt)
        return "Email must contain valid characters before '@'.";
    if (!hasDot) return "Email must contain '.' after '@'.";
    if (!validCharsBetweenAtAndDot)
        return "Email must contain valid characters between '@' and '.'.";
    if (!validCharactersAfterDot)
        return "Email must have valid characters after the last '.'.";
    return null;
};

export const validatePassword = (password: string): string | null => {
    // ... (your existing logic)
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumber = false;
    let hasSymbol = false;
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        if (!char) {
            continue;
        }
        if (char >= "A" && char <= "Z") {
            hasUppercase = true;
        } else if (char >= "a" && char <= "z") {
            hasLowercase = true;
        } else if (char >= "0" && char <= "9") {
            hasNumber = true;
        } else if (symbols.includes(char)) {
            hasSymbol = true;
        }
    }
    if (!hasUppercase) return "Password must contain an uppercase letter.";
    if (!hasLowercase) return "Password must contain a lowercase letter.";
    if (!hasNumber) return "Password must contain a number.";
    if (!hasSymbol) return "Password must contain a symbol.";
    return null;
};

// --- ✨ NEW VALIDATION FUNCTIONS ---

/**
 * Validates all fields for creating a new book.
 * Returns an array of error messages, or null if valid.
 */
export const validateBookData = (data: CreateBookInput): string[] | null => {
    const errors: string[] = [];

    // 1. Check for missing required fields (which you also do in the controller)
    if (!data.title) errors.push("Title is required.");
    if (!data.writer) errors.push("Writer is required.");
    if (!data.publisher) errors.push("Publisher is required.");
    if (data.publicationYear === undefined)
        errors.push("Publication year is required.");
    if (data.price === undefined) errors.push("Price is required.");
    if (data.stockQuantity === undefined)
        errors.push("Stock quantity is required.");
    if (!data.genreId) errors.push("Genre ID is required.");
    if (!isValidUrl(data.coverImage)) {
        errors.push("Cover image must be a valid URL.");
    }

    // 2. Check for "illogical" values
    if (data.price < 0) errors.push("Price must be a non-negative number.");
    if (data.stockQuantity < 0)
        errors.push("Stock quantity must be a non-negative number.");
    if (!Number.isInteger(data.stockQuantity))
        errors.push("Stock quantity must be an integer.");

    // 3. Check for future date
    if (data.publicationYear > new Date().getFullYear()) {
        errors.push("Publication year cannot be in the future.");
    }

    // 4. Check Enum value
    if (
        data.condition &&
        !Object.values(BookCondition).includes(data.condition)
    ) {
        errors.push(
            `Invalid condition. Must be one of: ${Object.values(
                BookCondition
            ).join(", ")}`
        );
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validates all fields for updating a book.
 * Returns an array of error messages, or null if valid.
 */
export const validateBookUpdateData = (
    data: UpdateBookInput
): string[] | null => {
    const errors: string[] = [];

    // Check *only* the fields that are present
    if (data.price !== undefined) {
        if (data.price < 0) errors.push("Price must be a non-negative number.");
    }
    if (data.stockQuantity !== undefined) {
        if (data.stockQuantity < 0)
            errors.push("Stock quantity must be a non-negative number.");
        if (!Number.isInteger(data.stockQuantity))
            errors.push("Stock quantity must be an integer.");
    }

    if (!isValidUrl(data.coverImage)) {
        errors.push("Cover image must be a valid URL (e.g., https://...)");
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validates the data for creating a new transaction.
 * Returns an array of error messages, or null if valid.
 */
export const validateTransactionData = (
    data: CreateTransactionInput
): string[] | null => {
    const errors: string[] = [];

    if (!data.books || !Array.isArray(data.books) || data.books.length === 0) {
        errors.push('A non-empty "books" array is required.');
        return errors; // Stop here if the array is missing
    }

    for (let i = 0; i < data.books.length; i++) {
        const item = data.books[i];
        if (!item) {
            errors.push(`Item ${i}: is invalid.`);
            continue;
        }
        if (!item.bookId || typeof item.bookId !== "string") {
            errors.push(`Item ${i}: "bookId" is missing or invalid.`);
        }
        if (
            item.quantity === undefined ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            errors.push(`Item ${i}: "quantity" must be a positive integer.`);
        }
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validates pagination query parameters.
 * Returns an error message or null if valid.
 */
export const validatePagination = (page: any, limit: any): string | null => {
    if (page) {
        const pageNum = Number(page);
        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return 'Query parameter "page" must be a positive integer.';
        }
    }
    if (limit) {
        const limitNum = Number(limit);
        if (!Number.isInteger(limitNum) || limitNum <= 0) {
            return 'Query parameter "limit" must be a positive integer.';
        }
    }
    return null;
};