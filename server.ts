import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required." });
    }

    try {
      // Configuration for email sending
      // The user should provide these in their .env file
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER, // e.g., your-email@gmail.com
          pass: process.env.SMTP_PASS, // e.g., your-app-password
        },
      });

      const mailOptions = {
        from: `"Ponte Creativo Contact" <${process.env.SMTP_USER || "noreply@pontecreativo.com"}>`,
        to: "lavozdelosmuertos+pontecreativo@gmail.com",
        replyTo: email,
        subject: `[Ponte Creativo] ${subject || "Nuevo mensaje de contacto"}`,
        text: `Nombre: ${name || "Anónimo"}\nEmail: ${email}\n\nMensaje:\n${message}`,
        html: `
          <h3>Nuevo mensaje de contacto desde Ponte Creativo</h3>
          <p><strong>Nombre:</strong> ${name || "Anónimo"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${subject || "Sin asunto"}</p>
          <hr />
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      };

      // If credentials are not provided, we just log it and return success for the demo
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("--- Contact Form Submission (MOCK) ---");
        console.log("To: lavozdelosmuertos+pontecreativo@gmail.com");
        console.log("From:", email);
        console.log("Subject:", subject);
        console.log("Message:", message);
        console.log("---------------------------------------");
        return res.json({ 
          success: true, 
          message: "Mensaje recibido (Modo Demo: Configura SMTP_USER y SMTP_PASS para envío real)." 
        });
      }

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Mensaje enviado correctamente." });
    } catch (error: any) {
      console.error("Error sending email:", error);
      
      // Specific check for Gmail App Password error
      if (error.message && error.message.includes("Application-specific password required")) {
        console.error("--- ERROR DE CONFIGURACIÓN ---");
        console.error("Google requiere una 'Contraseña de Aplicación'.");
        console.error("1. Ve a https://myaccount.google.com/apppasswords");
        console.error("2. Genera una contraseña de 16 caracteres.");
        console.error("3. Actualiza SMTP_PASS en Settings con ese código.");
        console.error("-------------------------------");
        return res.status(401).json({ 
          error: "Configuración de correo incompleta: Se requiere una 'Contraseña de Aplicación' de Google." 
        });
      }

      res.status(500).json({ error: "Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
