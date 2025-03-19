export const initialState = {
    nome: "",
    cognome: "",
    annoNascita: 0,
    cap: 0,
    squadraDelCuore: "",
    cellulare: "",
    telegram: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
    referredBy: "",
};

export default function registrationReducer(state, action) {
    switch (action.type) {
        case "UPDATE_DATA":
            return { ...state, ...action.payload, errors: {} };
        default:
            return state;
    }
}