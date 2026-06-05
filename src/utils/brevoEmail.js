const { transport } = require("../helpers/emailTransport");


const sendLowStockEmail = async (toEmail, subject, htmlContent) => {
  try {
    const info = await transport.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log("Brevo email sent:", info.messageId);
  } catch (error) {
    console.error("Brevo email send error:", error);
  }
};

module.exports = {
    sendLowStockEmail
}