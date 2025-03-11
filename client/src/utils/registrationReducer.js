export const initialState = {
    nome: "",
    cognome: "",
    eta: 0,
    cap: 0,
    sesso: "",
    cellulare: "",
    telegram: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
};

export default function registrationReducer(state, action) {
    switch (action.type) {
        case "UPDATE_DATA":
            return { ...state, ...action.payload, errors: {} };
        default:
            return state;
    }
}