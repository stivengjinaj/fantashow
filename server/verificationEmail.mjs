import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    },
});

const sendVerificationEmail = async (email, verificationLink) => {
    try {
        const mailOptions = {
            from: `"Fantashow" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verifica il tuo indirizzo email',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
                <img src="https://fantashow.onrender.com/favicon.png" alt="Fantashow Logo" style="width: 300px; margin-bottom: 150px;" />
                <h1>Verifica dell'Email</h1>
                <p>Grazie per la tua registrazione! Per favore, verifica la tua email cliccando sul link qui sotto:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verifica Email</a>
                <p>Se non hai creato un account, puoi ignorare questa email.</p>
                <p style="color: #888; font-size: 14px; margin-top: 20px;">Se non vedi questa email nella tua casella di posta, controlla la cartella spam e segnalala come "Non è spam".</p>
              </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw error;
    }
};

export default sendVerificationEmail;