import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "./Profile";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// --- MOCK ResizeObserver for Recharts ---
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe("Profile Component", () => {
  const renderWithRouter = (username) => {
    return render(
      <MemoryRouter initialEntries={[`/profile/${username}`]}>
        <Routes>
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("renders user not found if username does not exist", () => {
    renderWithRouter("NonExistentUser");

    expect(screen.getByText("User not found")).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });

  test("renders user stats and pie chart if user exists with challenges", () => {
    const { container } = renderWithRouter("Alice"); // Alice has a team and challenges

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Score:")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Challenges Completed:")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument(); // 4+3+2+1

    // Team link should exist
    const teamLink = screen.getByText("CryptoMasters");
    expect(teamLink).toBeInTheDocument();
    expect(teamLink.closest("a")).toHaveAttribute("href", "/team/CryptoMasters");

    // Pie chart container should render
    const chartContainer = container.querySelector("div.profile-chart");
    expect(chartContainer).toBeInTheDocument();
  });

  test("renders 'No challenges completed yet' and no pie chart for user with no challenges", () => {
  const { container } = renderWithRouter("Dave"); // Dave has no challenges and no team

  expect(screen.getByText("Dave")).toBeInTheDocument();
  expect(screen.getByText("Score:")).toBeInTheDocument();
  expect(screen.getByText("60")).toBeInTheDocument();

  expect(screen.getByText("Challenges Completed:")).toBeInTheDocument();
  expect(screen.getByText("No challenges completed yet")).toBeInTheDocument();

  // Team should render "No team"
  expect(screen.getByText("No team")).toBeInTheDocument();

  // Pie chart should NOT render
  const pieChart = container.querySelector("div.profile-chart");
  expect(pieChart).toBeNull(); 
});


  test("renders team link correctly for user with team and conditional styles", () => {
    renderWithRouter("Bob");

    const teamLink = screen.getByText("CryptoMasters");
    expect(teamLink).toBeInTheDocument();
    expect(teamLink.closest("a")).toHaveAttribute("href", "/team/CryptoMasters");
  });
});
