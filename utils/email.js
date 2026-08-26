const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Travel Planner <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // SEND EMAIL
  async send(subject, html) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // WELCOME EMAIL
  async sendWelcome() {
    const html = `
      <div>
        <h1>Welcome to Travel Planner, ${this.firstName}!</h1>

        <p>
          Thank you for joining the Travel Planner family.
        </p>

        <p>
          Your account has been successfully created.
        </p>

        <p>
          <a href="${this.url}">
            Visit your account
          </a>
        </p>

        <p>
          We hope you enjoy Travel Planner!
        </p>

        <p>
          See you soon,<br>
          The Travel Planner Team
        </p>
      </div>
    `;

    await this.send("Welcome to the Travel Planner Family!", html);
  }

  // PASSWORD RESET EMAIL
  async sendPasswordReset() {
    const html = `
      <div>
        <h1>Password Reset</h1>

        <p>Hello ${this.firstName},</p>

        <p>
          You requested a password reset for your
          Travel Planner account.
        </p>

        <p>
          This reset link is valid for only 10 minutes.
        </p>

        <p>
          <a href="${this.url}">
            Reset your password
          </a>
        </p>

        <p>
          If you did not request this password reset,
          please ignore this email.
        </p>

        <p>
          The Travel Planner Team
        </p>
      </div>
    `;

    await this.send(
      "Your password reset token (valid for only 10 minutes)",
      html,
    );
  }

  // BOOKING CONFIRMATION EMAIL
  async sendBookingConfirmation(tour, booking) {
    const html = `
      <div>
        <h1>Booking Confirmation</h1>

        <p>Hello ${this.firstName},</p>

        <p>
          Your booking has been successfully confirmed!
        </p>

        <h2>${tour.name}</h2>

        <p>
          <strong>Price:</strong> $${booking.price}
        </p>

        <p>
          <strong>Booking date:</strong>
          ${new Date(booking.createdAt).toLocaleDateString()}
        </p>

        <p>
          Your payment has been received and your place
          on this tour is confirmed.
        </p>

        <p>
          <a href="${this.url}">
            View my tours
          </a>
        </p>

        <p>
          Thank you for choosing Travel Planner.
        </p>

        <p>
          See you soon,<br>
          The Travel Planner Team
        </p>
      </div>
    `;

    await this.send("Booking Confirmation - Travel Planner", html);
  }
};
