import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ChallengePage from "./challengespage";
import { vi } from "vitest";

beforeEach(() => {
  vi.spyOn(global, "fetch").mockImplementation((url) => {
    if (url === "/api/auth/status") {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            loggedIn: true,
            user: { username: "alice" },
          }),
      });
    }

    if (url === "/api/challenges") {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            Web: [
              {
                id: 1,
                title: "Warm Up",
                category: "Web",
                points: 100,
                description: "Test challenge",
                hints: [
                  "Check the source code.",
                  "Look for hidden comments.",
                ],
                completedBy: [{ username: "alice", points: 100 }],
                flag: "warmup123",
              },
            ],
            Reversing: [
              {
                id: 2,
                title: "Reverse Me",
                category: "Reversing",
                points: 200,
                description: "Reverse engineering challenge",
                hints: ["Use a debugger.", "Check strings in binary."],
                completedBy: [],
                flag: "rev123",
              },
            ],
          }),
      });
    }

    return Promise.reject(new Error("Unknown API call: " + url));
  });

  localStorage.setItem("loggedInUser", JSON.stringify({ username: "alice" }));
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("ChallengePage and ChallengeModal", () => {
  test("renders challenges and opens modal", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Web")).toBeInTheDocument();
    expect(screen.getByText("Reversing")).toBeInTheDocument();

    fireEvent.click(await screen.findByText("Warm Up"));

    const modal = screen.getByRole("heading", { name: "Warm Up" }).closest(".challenge-modal");
    expect(modal).toBeInTheDocument();

    expect(within(modal).getByText(/Points:/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Description:/i)).toBeInTheDocument();
    expect(within(modal).getByText("Check the source code.")).toBeInTheDocument();
    expect(within(modal).getByText("Look for hidden comments.")).toBeInTheDocument();
  });

  test("instance start, extend, and stop logic", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));

    const modal = screen.getByRole("heading", { name: "Warm Up" }).closest(".challenge-modal");

    fireEvent.click(within(modal).getByText("Start Instance"));
    expect(await within(modal).findByText(/Instance started!/i)).toBeInTheDocument();

    const instanceLink = within(modal).getByText(/Go to Instance/i);
    expect(instanceLink.tagName).toBe("A");

    fireEvent.click(within(modal).getByText("Extend Expiry"));
    expect(
      await within(modal).findByText(/you can extend expiry only/i)
    ).toBeInTheDocument();

    fireEvent.click(within(modal).getByText("Stop Instance"));
    expect(await within(modal).findByText(/Instance stopped/i)).toBeInTheDocument();
  });

  test("flag submission: correct and incorrect flags", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));
    const modal = screen.getByRole("heading", { name: "Warm Up" }).closest(".challenge-modal");

    const input = within(modal).getByPlaceholderText("Enter flag");
    const submitBtn = within(modal).getByText("Submit");

    fireEvent.change(input, { target: { value: "wrongflag" } });
    fireEvent.click(submitBtn);
    expect(await within(modal).findByText(/Red flag!/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "warmup123" } });
    fireEvent.click(submitBtn);
    expect(await within(modal).findByText(/Correct! \+100 points/i)).toBeInTheDocument();

    expect(input.value).toBe("");
  });

  test("modal closes on clicking Close button", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));

    const modalHeading = screen.getByRole("heading", { name: "Warm Up" });
    const modal = modalHeading.closest(".challenge-modal");

    fireEvent.click(within(modal).getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Warm Up" })).not.toBeInTheDocument();
    });

    expect(screen.getByText("Warm Up")).toBeInTheDocument();
  });

  test("completed users are displayed", async () => {
    render(
      <MemoryRouter>
        <ChallengePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Warm Up"));
    const modal = screen.getByRole("heading", { name: "Warm Up" }).closest(".challenge-modal");

    const completedAlice = within(modal).getByText("alice");
    expect(completedAlice).toBeInTheDocument();
    expect(within(modal).getByText(/100 pts/i)).toBeInTheDocument();
    expect(completedAlice.closest("a")).toHaveAttribute("href", "/profile/alice");
  });
});
