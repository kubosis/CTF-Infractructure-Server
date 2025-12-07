import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import '@testing-library/jest-dom'; 
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import ChangePassword from "./ChangePassword";

// Mock utils
vi.mock("../utils/passwordUtils", () => ({
  evaluatePassword: (password) => ({
    message: password.length >= 12 ? "Valid password" : "Invalid password",
    strength: password.length >= 12 ? 4 : 1,
    isValid: password.length >= 12,
  }),
  hashPassword: (password) => Promise.resolve(`hashed-${password}`),
}));


global.fetch = vi.fn();

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/change-password/:userId" element={ui} />
        <Route path="/admin" element={<div>Admin Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ChangePassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects if user is not admin in production", async () => {
    // Mock fetch response user role "user" 
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "user" } }),
    });

    renderWithRouter(<ChangePassword />, {
      route: "/admin/change-password/123",
    });

    await waitFor(() => {
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
  });

  test("enables submit only if password valid and match", async () => {
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    });

    renderWithRouter(<ChangePassword />, {
      route: "/admin/change-password/123",
    });

    const passwordInput = await screen.findByPlaceholderText("New Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: /change password/i });

    
    expect(submitButton).toBeDisabled();

    
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "short" } });
      fireEvent.change(confirmInput, { target: { value: "short" } });
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "ValidPassword123!" } });
      fireEvent.change(confirmInput, { target: { value: "ValidPassword123!" } });
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

  
    await act(async () => {
      fireEvent.change(confirmInput, { target: { value: "Mismatch123!" } });
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test("successful password change shows success message and redirects", async () => {
    // Mock admin user check + successful password change
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    renderWithRouter(<ChangePassword />, {
      route: "/admin/change-password/123",
    });

    const passwordInput = await screen.findByPlaceholderText("New Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: /change password/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "ValidPassword123!" } });
      fireEvent.change(confirmInput, { target: { value: "ValidPassword123!" } });
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() =>
      expect(
        screen.getByText(/password for user 123 changed successfully/i)
      ).toBeInTheDocument()
    );

    await waitFor(() => {
      expect(screen.getByText("Admin Page")).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
