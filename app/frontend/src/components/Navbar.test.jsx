// Navbar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "./Navbar";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock useNavigate
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  };
});

// DEMO_MODE mock (default true)
vi.mock("../config/demo", () => ({
  DEMO_MODE: true,
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    localStorage.clear();
  });

  const setup = (props) => {
    return render(
      <MemoryRouter>
        <Navbar {...props} />
      </MemoryRouter>
    );
  };

  // --- CONDITIONAL UI TESTS ---

  test("shows Register + Login when no user is logged in", () => {
    setup({ ctfActive: true, loggedInUser: null });

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  test("shows My Profile + Logout when user IS logged in", () => {
    setup({
      ctfActive: true,
      loggedInUser: { username: "demoUser" },
    });

    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  // --- LOGOUT FLOW TEST ---

  test("logout clears state + navigates to /", () => {
    const setLoggedInUser = vi.fn();

    setup({
      ctfActive: true,
      loggedInUser: { username: "demoUser" },
      setLoggedInUser,
    });

    const logoutBtn = screen.getByText("Logout");

    fireEvent.click(logoutBtn);

    expect(setLoggedInUser).toHaveBeenCalledWith(null);


    expect(navigateMock).toHaveBeenCalledWith("/");

  
    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});
