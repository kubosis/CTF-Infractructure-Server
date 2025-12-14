import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "./Login";

// ===== mocks =====
vi.mock("../utils/passwordUtils", () => ({
  hashPassword: vi.fn(async (pwd) => `hashed-${pwd}`),
}));

vi.mock("../config/demo", () => ({
  DEMO_MODE: false,
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login.jsx – production login flow", () => {
  let setLoggedInUser;

  beforeEach(() => {
    setLoggedInUser = vi.fn();
    vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows backend validation error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: "Invalid email or password.",
      }),
    });

    render(
      <MemoryRouter>
        <Login setLoggedInUser={setLoggedInUser} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(
  screen.getByRole("button", { name: "Login" })
);

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(setLoggedInUser).not.toHaveBeenCalled();
  });

  test("successful login without MFA redirects to home", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { username: "alice", role: "user" },
        requiresMFA: false,
      }),
    });

    render(
      <MemoryRouter>
        <Login setLoggedInUser={setLoggedInUser} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(
  screen.getByRole("button", { name: "Login" })
);

    await waitFor(() => {
      expect(setLoggedInUser).toHaveBeenCalledWith({
        username: "alice",
        role: "user",
      });
    });

    expect(await screen.findByText(/Logged in successfully!/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("successful login with MFA redirects to /mfa-verify", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { username: "bob", role: "user" },
        requiresMFA: true,
      }),
    });

    render(
      <MemoryRouter>
        <Login setLoggedInUser={setLoggedInUser} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "bob@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "securepass" },
    });

    fireEvent.click(
  screen.getByRole("button", { name: "Login" })
);

    await waitFor(() => {
      expect(setLoggedInUser).toHaveBeenCalledWith({
        username: "bob",
        role: "user",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/mfa-verify");
  });

  test("server/network error is handled gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Network down"));

    render(
      <MemoryRouter>
        <Login setLoggedInUser={setLoggedInUser} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password" },
    });

    fireEvent.click(
  screen.getByRole("button", { name: "Login" })
);

    expect(
      await screen.findByText("Server error. Please try again later.")
    ).toBeInTheDocument();

    expect(setLoggedInUser).not.toHaveBeenCalled();
  });
});
