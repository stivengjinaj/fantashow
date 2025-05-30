import {loadStripe} from '@stripe/stripe-js';

export const stripePromise = loadStripe("pk_live_51R6E7vJxIWLRjTTs3zjLiTN0R53mWgns5gVyMEpnuYbR8fHhoPaNKGc8Gz1lq4fd96Ox2rqLJ7jBonPTlZV2Y3AZ00unGWvKxK", {
    betas: ['custom_checkout_beta_5'],
});

