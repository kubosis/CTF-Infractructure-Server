import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import ChallengePage from "./challengepage";

// Mock localStorage to simulate logged-in user
beforeEach(() => {
  localStorage.setItem("loggedInUser", JSON.stringify({ username: "alice" }));
});

afterEach(() => {
  localStorage.clear();
});

describe("ChallengePage and ChallengeModal", () => {
  test("renders challenges and opens modal", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    // Check that categories are rendered
    expect(await screen.findByText("Web")).toBeInTheDocument();
    expect(screen.getByText("Reversing")).toBeInTheDocument();

    // Click on a challenge card
    const challengeCard = screen.getByText("Warm Up");
    fireEvent.click(challengeCard);

    // Modal should appear
    expect(screen.getByText("Warm Up")).toBeInTheDocument();
    expect(screen.getByText(/Points:/i)).toBeInTheDocument();
    expect(screen.getByText(/Description:/i)).toBeInTheDocument();

    // Hints should be visible
    expect(screen.getByText("Check the source code.")).toBeInTheDocument();
    expect(screen.getByText("Look for hidden comments.")).toBeInTheDocument();
  });

  test("instance start, extend, and stop logic", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    // Open a challenge
    fireEvent.click(await screen.findByText("Warm Up"));

    const startBtn = screen.getByText("Start Instance");
    fireEvent.click(startBtn);

    // Check that instance started feedback is shown
    expect(await screen.findByText(/Instance started!/i)).toBeInTheDocument();

    // Check that "Go to Instance" link appears
    const instanceLink = screen.getByText(/Go to Instance/i);
    expect(instanceLink).toBeInTheDocument();
    expect(instanceLink.tagName).toBe("A");

    // Extend expiry when more than 15 minutes left
    const extendBtn = screen.getByText("Extend Expiry");
    fireEvent.click(extendBtn);
    expect(await screen.findByText(/you can extend expiry only/i)).toBeInTheDocument();

    // Stop instance
    const stopBtn = screen.getByText("Stop Instance");
    fireEvent.click(stopBtn);
    expect(await screen.findByText(/Instance stopped/i)).toBeInTheDocument();
  });

  test("flag submission: correct and incorrect flags", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    // Open a challenge
    fireEvent.click(await screen.findByText("Warm Up"));

    const input = screen.getByPlaceholderText("Enter flag");
    const submitBtn = screen.getByText("Submit");

    // Incorrect flag
    fireEvent.change(input, { target: { value: "wrongflag" } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/Red flag!/i)).toBeInTheDocument();

    // Correct flag
    fireEvent.change(input, { target: { value: "warmup123" } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/Correct! \+100 points/i)).toBeInTheDocument();

    // After submission, input should be cleared
    expect(screen.getByPlaceholderText("Enter flag").value).toBe("");
  });

  test("modal closes on clicking Close button", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));

    const closeBtn = screen.getAllByText("Close")[0]; // multiple Close buttons exist
    fireEvent.click(closeBtn);

    // Modal content should no longer exist
    await waitFor(() => {
      expect(screen.queryByText("Warm Up")).not.toBeInTheDocument();
    });
  });

  test("completed users are displayed", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));

    // Alice completed this challenge
    const completedAlice = screen.getByText(/alice/i);
    expect(completedAlice).toBeInTheDocument();
    expect(screen.getByText(/100 pts/i)).toBeInTheDocument();

    // There should be a link to profile
    expect(completedAlice.closest("a")).toHaveAttribute("href", "/profile/alice");
  });
});
