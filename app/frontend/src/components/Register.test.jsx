// Register.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import Register from "./Register";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { act } from "react-dom/test-utils";

// === Mock hashPassword és evaluatePassword ===
vi.mock("../utils/passwordUtils", () => ({
  hashPassword: async (password) => `hashed-${password}`,
  evaluatePassword: (password) => {
    const strength = password.length >= 12 ? 4 : 1;
    return {
      strength,
      message: strength === 4 ? "Strong password" : "Weak password",
      isValid: strength === 4,
    };
  },
}));

describe("Register Component", () => {

  const setup = () => {
    return render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  };

  test("disables register button if passwords do not match", () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const button = screen.getByRole("button", { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "Mismatch123!" } });

    expect(button).toBeDisabled();
  });

  test("disables register button if password is weak", () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const button = screen.getByRole("button", { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.change(confirmInput, { target: { value: "weak" } });

    expect(button).toBeDisabled();
  });

  test("enables register button if password is strong and matches", () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const button = screen.getByRole("button", { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

    expect(button).toBeEnabled();
  });

  test("shows error message if password is weak on submit", async () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const button = screen.getByRole("button", { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: "weakpass" } });
    fireEvent.change(confirmInput, { target: { value: "weakpass" } });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() =>
      expect(screen.getByText(/Weak password/i)).toBeInTheDocument()
    );
  });

  test("shows error message if passwords do not match on submit", async () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const button = screen.getByRole("button", { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "Mismatch123!" } });

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    );
  });
});
