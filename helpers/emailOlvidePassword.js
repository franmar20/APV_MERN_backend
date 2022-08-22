import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {

    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos;

    //enviar el email
    const info = await transport.sendMail({
        from: "APV - Administrador de Pacientes de Veterinaria",
        to: email,
        subject: "Restablece tu Password",
        text: "Restablece tu Password",
        html: `<p>Hola: ${nombre}, has solicitado reestablecer tu password en APV.</p>
            <p>Sigue el siguiente enlace para generar un nuevo Password:
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a></p>

            <p>Si no creaste la cuenta, Ignora este mensaje.</p>
        `
    });

    console.log("Mensaje enviado: %s", info.messageId);

};

export default emailOlvidePassword;