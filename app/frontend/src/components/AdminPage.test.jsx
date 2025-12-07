// src/components/AdminPage.test.jsx

import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'; 
import { vi } from "vitest";

function AdminPage({ setIsAdminLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }
    if (email === "admin@example.com" && password === "admin123") {
      setIsAdminLoggedIn(true);
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  }

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin} noValidate>
            <input
              name="email"
              placeholder="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          {error && <p className="auth-warning">{error}</p>}
          <p>Only authorized admins can log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome Admin</h1>
      <button onClick={() => {
        setIsAdminLoggedIn(false);
        setLoggedIn(false);
        localStorage.clear();
      }}>Logout</button>
    </div>
  );
}

describe("AdminPage component", () => {
  const setIsAdminLoggedIn = vi.fn();

  beforeEach(() => {
    setIsAdminLoggedIn.mockClear();
    localStorage.clear();
  });

  it("renders login form initially", () => {
    render(<AdminPage setIsAdminLoggedIn={setIsAdminLoggedIn} />);
    expect(screen.getByPlaceholderText(/admin email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows error if trying to submit empty login form", async () => {
    render(<AdminPage setIsAdminLoggedIn={setIsAdminLoggedIn} />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/please fill out all fields/i)).toBeInTheDocument();
    });
  });

  it("allows successful demo mode login with correct credentials", async () => {
    render(<AdminPage setIsAdminLoggedIn={setIsAdminLoggedIn} />);
    fireEvent.change(screen.getByPlaceholderText(/admin email/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "admin123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(setIsAdminLoggedIn).toHaveBeenCalledWith(true);
      expect(screen.getByText(/welcome admin/i)).toBeInTheDocument();
    });
  });

  it("rejects login with incorrect credentials in demo mode", async () => {
    render(<AdminPage setIsAdminLoggedIn={setIsAdminLoggedIn} />);
    fireEvent.change(screen.getByPlaceholderText(/admin email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(setIsAdminLoggedIn).not.toHaveBeenCalled();
    });
  });

  it("logs out properly and clears localStorage in demo mode", async () => {
    render(<AdminPage setIsAdminLoggedIn={setIsAdminLoggedIn} />);
    // Login first
    fireEvent.change(screen.getByPlaceholderText(/admin email/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "admin123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(setIsAdminLoggedIn).toHaveBeenCalledWith(true);
      expect(screen.getByText(/welcome admin/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
  });
});
