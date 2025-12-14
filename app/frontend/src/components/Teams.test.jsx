// Teams.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; // ✅ add this for matchers
import Teams from "./Teams";
import * as passwordUtils from "../utils/passwordUtils";
import { vi } from "vitest";

// Mock the hashPassword function

// Mock the hashPassword function
vi.spyOn(passwordUtils, "hashPassword").mockImplementation(async (pwd) => `hashed-${pwd}`);
describe("Teams Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows error if team name or password is empty", async () => {
    render(<Teams />);
    const createButton = screen.getByText("Create Team");

    fireEvent.click(createButton);

    expect(await screen.findByText("Please enter both team name and password.")).toBeInTheDocument();
  });

  test("shows error if password is less than 8 characters", async () => {
    render(<Teams />);
    const nameInput = screen.getByPlaceholderText("Team Name");
    const passwordInput = screen.getByPlaceholderText("Team Password (min 8 characters)");
    const createButton = screen.getByText("Create Team");

    fireEvent.change(nameInput, { target: { value: "MyTeam" } });
    fireEvent.change(passwordInput, { target: { value: "1234567" } });
    fireEvent.click(createButton);

    expect(await screen.findByText("Password must be at least 8 characters long.")).toBeInTheDocument();
  });

  test("generates invite token on successful team creation", async () => {
    render(<Teams />);
    const nameInput = screen.getByPlaceholderText("Team Name");
    const passwordInput = screen.getByPlaceholderText("Team Password (min 8 characters)");
    const createButton = screen.getByText("Create Team");

    fireEvent.change(nameInput, { target: { value: "MyTeam" } });
    fireEvent.change(passwordInput, { target: { value: "securepass" } });
    fireEvent.click(createButton);

    // Wait for message to update
    const successMessage = await screen.findByText(/Team "MyTeam" created!/);
    expect(successMessage).toBeInTheDocument();

    // Invite link input (readonly) 
    const inviteInput = screen.getAllByRole("textbox").find(
        (input) => input.hasAttribute("readonly")
    );
    expect(inviteInput).toBeInTheDocument();
    expect(inviteInput.value).toContain("/join-team?token=");
});
});
