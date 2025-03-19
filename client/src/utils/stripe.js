import {loadStripe} from '@stripe/stripe-js';
import {createContext, useContext} from "react";

export const stripePromise = loadStripe("pk_test_51R1TZaFA0oBwMjT9N47Y7sXK0hWYE5TsDQuwBsiOCqLaRhHVsWxVDqMAe4x8xHzaqiAsXaX6fAr7o7VXFsSbKzST00HtyK8yOm", {
    betas: ['custom_checkout_beta_5'],
});

