import { signup } from "./signup";
import { login, logout } from "./login";

// SIGN UP

const signupForm = document.querySelector(".form--signup");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    const btn = signupForm.querySelector("button");
    const originalText = btn.textContent;

    try {
      btn.textContent = "Loading...";
      btn.disabled = true;

      await signup(name, email, password, passwordConfirm);
    } catch (err) {
      console.error(err);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// LOGIN

const loginForm = document.querySelector(".form--login");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const btn = loginForm.querySelector("button");
    const originalText = btn.textContent;

    try {
      btn.textContent = "Loading...";
      btn.disabled = true;

      await login(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// LOGOUT

const logoutBtn = document.querySelector(".nav__el--logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// BOOK TOUR

const bookTourBtn = document.getElementById("book-tour");

if (bookTourBtn) {
  bookTourBtn.addEventListener("click", () => {
    const tourId = bookTourBtn.dataset.tourId;

    if (!tourId) {
      console.error("Tour ID is missing.");
      return;
    }

    window.location.href = `/payment/${tourId}`;
  });
}

// STRIPE PAYMENT

const paymentForm = document.getElementById("stripe-payment-form");

if (paymentForm) {
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = document.getElementById("pay-button");
    const message = document.getElementById("payment-message");
    const tourId = document.getElementById("tour-id").value;

    try {
      button.disabled = true;
      button.textContent = "Redirecting to Stripe...";
      message.textContent = "";

      const res = await fetch("/api/v1/bookings/payment", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          tour: tourId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to create checkout session.");
      }

      if (!data.sessionUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      // Redirect user to Stripe Checkout
      window.location.href = data.sessionUrl;
    } catch (err) {
      console.error("Stripe payment error:", err);

      message.textContent = err.message || "Payment failed.";

      button.disabled = false;
      button.textContent = "Pay now";
    }
  });
}

// UPDATE PASSWORD

const passwordForm = document.querySelector(".form-user-password");

if (passwordForm) {
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordCurrent = document.getElementById("password-current").value;

    const password = document.getElementById("password").value;

    const passwordConfirm = document.getElementById("password-confirm").value;

    const button = passwordForm.querySelector(".btn--save-password");

    try {
      button.textContent = "Updating...";
      button.disabled = true;

      const res = await fetch("/api/v1/users/updateMyPassword", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          passwordCurrent,
          password,
          passwordConfirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password update failed.");
      }

      alert("Password updated successfully!");

      window.location.reload();
    } catch (err) {
      console.error("Password update error:", err);

      alert(err.message || "Something went wrong.");

      button.textContent = "Save password";
      button.disabled = false;
    }
  });
}
