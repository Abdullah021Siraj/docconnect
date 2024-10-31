import nodemailer from "nodemailer";

const email = process.env.Email;
const pass = process.env.Email_Pass;


export const transporter = nodemailer.createTransport({
    service:"gmail",
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: email,
      pass: pass,
    },
  });


export const info = {
    from: email, 
  };