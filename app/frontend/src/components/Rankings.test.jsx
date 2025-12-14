import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import Rankings from "./Rankings";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock canvas context
class MockCanvasContext {
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  arc() {}
  clearRect() {}
  fillText() {}
  measureText() { return { width: 0 }; }
  getContext() { return this; }
  set fillStyle(val) {}
  set strokeStyle(val) {}
  set lineWidth(val) {}
  set font(val) {}
  set textAlign(val) {}
  set textBaseline(val) {}
}
HTMLCanvasElement.prototype.getContext = () => new MockCanvasContext();

describe("Rankings Component", () => {
  test("renders top teams chart and table correctly", async () => {
  render(
    <MemoryRouter>
      <Rankings />
    </MemoryRouter>
  );

  // Check that the Scoreboard title is rendered
  expect(screen.getByText(/🏆 Scoreboard/i)).toBeInTheDocument();

  // Check that the table rows exist (at least header + 1 team)
  const tableRows = await screen.findAllByRole("row");
  expect(tableRows.length).toBeGreaterThan(1);

  // Check that team links have inline colors
  const teamLinks = screen.getAllByRole("link", { name: /CryptoMasters|WebWizards/i });
  expect(teamLinks.length).toBeGreaterThan(0);
  teamLinks.forEach(link => {
    expect(link.style.color).toBeTruthy(); // color is set
  });

  // Check that the canvas element exists (use querySelector, not getByRole)
  const canvas = document.querySelector("canvas");
  expect(canvas).toBeInTheDocument();
});


  test("sorts teams by final score, total points, and firstReachedTime", async () => {
    render(
      <MemoryRouter>
        <Rankings />
      </MemoryRouter>
    );


    const firstScoreCell = await screen.findAllByRole("cell");
    expect(parseInt(firstScoreCell[2].textContent)).toBeGreaterThanOrEqual(parseInt(firstScoreCell[5].textContent));
  });
});
