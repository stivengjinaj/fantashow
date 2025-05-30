import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import generalRoutes from "./generalRoutes.mjs";
import authenticationRoutes from "./authenticationRoutes.mjs";
import paymentRoutes from "./paymentRoutes.mjs";
import checkoutRoutes from "./stripe.mjs";
import adminRoutes from "./adminRoutes.mjs";

const app = express();

const corsOptions = {
    origin: ['https://fantashowsc.onrender.com'],
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(generalRoutes);
app.use(authenticationRoutes);
app.use(paymentRoutes);
app.use(checkoutRoutes);
app.use(adminRoutes)

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
