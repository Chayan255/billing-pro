const logout = async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    // 🔥 HARD REDIRECT – clears client cache & state
    window.location.replace("/login");
  }
};
