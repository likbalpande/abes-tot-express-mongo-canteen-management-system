const nodemailer = require("nodemailer"); // npm i nodemailer

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "cloudfile2024@gmail.com",
        pass: "bjlluyfjlptmkibm",
    },
});

const sendEmail = async (email, otp) => {
    const info = {
        from: "Likhilesh-at-ABES-Canteen",
        to: email,
        subject: "OTP verification fro ABES Canteen Registration",
        html: `
            <div>
                <p>This is the security email from ABES Canteen App. Please DO NOT share the otp with anyone</p>
                <h4>OTP: ${otp}</h4>
                <p>Copyright@ABES-Canteen-App</p>
            </div>
        `,
    };

    try {
        const resp = await transporter.sendMail(info);
        console.log("Message sent: %s", resp.messageId);
        return true;
    } catch (err) {
        console.log(err.message);
        return false;
    }
};

module.exports = { sendEmail };
