import ERROR_MESSAGES from "../constants/errors.js";

const getError = (errorCode) => {
    switch (errorCode) {
        case ERROR_MESSAGES.FIREBASE_FIRESTORE.INVALID_CREDENTIALS:
            return "Credenziali non valide.";
        case ERROR_MESSAGES.FIREBASE_FIRESTORE.MISSING_CREDENTIALS:
            return "Credenziali mancanti.";
        case ERROR_MESSAGES.FIREBASE_FIRESTORE.REGISTER_SUCCESS:
            return "Utente registrato con successo."
        case ERROR_MESSAGES.ADMINISTRATOR.UNAUTHORIZED:
            return "Non autorizzato.";
        case ERROR_MESSAGES.ADMINISTRATOR.MISSING_CREDENTIALS:
            return "Credenziali mancanti.";
        case ERROR_MESSAGES.REFERRAL.INVALID_REFERRAL:
            return "Referral non valido.";
        case ERROR_MESSAGES.GENERAL.SERVER_ERROR:
            return "Errore del server.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.INVALID_CREDENTIALS:
            return "Email o password errata.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.MISSING_CREDENTIALS:
            return "Credenziali mancanti.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.INVALID_EMAIL:
            return "Email errato.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.REGISTER_SUCCESS:
            return "Utente registrato con successo.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.USER_DISABLED:
            return "Account non attivo.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.EMAIL_ALREADY_IN_USE:
            return "Email già in uso.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.USER_NOT_FOUND:
            return "Utente non trovato.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.WEAK_PASSWORD:
            return "Password non sicura.";
        case ERROR_MESSAGES.FIREBASE_AUTHENTICATION.WRONG_PASSWORD:
            return "Password errata."
        case "User not authenticated":
            return "Utente non valido.";
    }
};

export default getError;
