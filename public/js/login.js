export const login = async (email, password) => {
  try {
    const res = await fetch("/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Logged in successfully!");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Error logging in! Try again.");
  }
};
export const logout = async () => {
  try {
    const res = await fetch("/api/v1/users/logout");

    const data = await res.json();

    if (data.status === "success") {
      location.assign("/");
    }
  } catch (err) {
    console.error(err);
    alert("Error logging out! Try again.");
  }
};
