import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import JoinTeam from "./JoinTeam";

vi.mock("../utils/passwordUtils", () => ({
  hashPassword: vi.fn(),
}));

import * as passwordUtils from "../utils/passwordUtils";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/join" element={ui} />
        <Route path="/teams" element={<div>Teams Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("JoinTeam Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows invalid link message if no token", async () => {
    renderWithRouter(<JoinTeam />, { route: "/join" });

    await waitFor(() => {
      expect(screen.getByText("Invalid invite link.")).toBeInTheDocument();
    });
  });

  test("shows invite link not recognized for unknown token", async () => {
    renderWithRouter(<JoinTeam />, { route: "/join?token=unknown" });

    await waitFor(() => {
      expect(screen.getByText("Invite link not recognized.")).toBeInTheDocument();
    });
  });

  test("displays team name if token is valid", async () => {
    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    await waitFor(() => {
      expect(screen.getByText(/Enter the password for the team/i)).toBeInTheDocument();
      expect(screen.getByText("CryptoMasters")).toBeInTheDocument();
    });
  });

  test("submit button is disabled if password is less than 8 chars", async () => {
    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    const input = await screen.findByPlaceholderText("Team Password");
    const button = screen.getByRole("button", { name: /join team/i });

    fireEvent.change(input, { target: { value: "short" } });

    expect(button).toBeDisabled();
  });

  test("submit button is disabled if password is less than 8 chars", async () => {
    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    const input = await screen.findByPlaceholderText("Team Password");
    const button = screen.getByRole("button", { name: /join team/i });

    fireEvent.change(input, { target: { value: "short" } });

    expect(button).toBeDisabled();
  });




  test("shows success message on correct password", async () => {
    // token: abcd1234 -> teamPassword: "password123"
    // Mock hashPassword to return same hash for enteredPassword and teamPassword

    passwordUtils.hashPassword.mockImplementation(async (password) => {
      if (password === "password123") return "hash123";
      if (password === "password123") return "hash123";
      return "wronghash";
    });

    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    const input = await screen.findByPlaceholderText("Team Password");
    const button = screen.getByRole("button", { name: /join team/i });

    fireEvent.change(input, { target: { value: "password123" } });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("You have successfully joined CryptoMasters!")).toBeInTheDocument();
    });
  });

  test("shows error message on incorrect password", async () => {
    // Mock hashPassword to always return a hash different from the team's password hash

    passwordUtils.hashPassword.mockImplementation(async (password) => {
      if (password === "password123") return "hash123";
      return "wronghash";
    });

    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    const input = await screen.findByPlaceholderText("Team Password");
    const button = screen.getByRole("button", { name: /join team/i });

    fireEvent.change(input, { target: { value: "wrongpassword" } });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Incorrect password. Try again.")).toBeInTheDocument();
    });
  });

  test("after success message, back to teams link works", async () => {
    passwordUtils.hashPassword.mockImplementation(async (password) => {
      if (password === "password123") return "hash123";
      return "wronghash";
    });

    renderWithRouter(<JoinTeam />, { route: "/join?token=abcd1234" });

    const input = await screen.findByPlaceholderText("Team Password");
    const button = screen.getByRole("button", { name: /join team/i });

    fireEvent.change(input, { target: { value: "password123" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("You have successfully joined CryptoMasters!")).toBeInTheDocument();
    });

    const backLink = screen.getByRole("link", { name: /back to teams/i });
    fireEvent.click(backLink);

    await waitFor(() => {
      expect(screen.getByText("Teams Page")).toBeInTheDocument();
    });
  });
});
