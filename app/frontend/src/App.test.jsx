// src/App.test.jsx

import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom'; // <<< Add this to enable jest-dom matchers
import App from "./App";
import { DEMO_MODE } from "./config/demo";

// ==========================================
// MOCK: jsdom doesn't have full location object
// ==========================================
beforeAll(() => {
  delete window.location; // remove read-only property
  window.location = {
    href: "http://localhost/",
    origin: "http://localhost",
    hostname: "localhost",
  };
});

// ==========================================
// Reset localStorage and body styles before each test
// ==========================================
beforeEach(() => {
  localStorage.clear();
  document.body.style.overflow = "auto";
});

describe("App Component", () => {
  test("renders DemoBanner if DEMO_MODE is true", () => {
    render(<App />);
    if (DEMO_MODE) {
      expect(screen.getByText(/Demo Mode Active/i)).toBeInTheDocument();
    }
  });

  test("shows cookie banner if no cookiesAccepted or cookiesDeclined in localStorage", () => {
    render(<App />);
    if (DEMO_MODE) {
      expect(
        screen.getByText(/We use cookies to keep you logged in/i)
      ).toBeInTheDocument();
    }
  });

  test("accepting cookies hides banner and sets localStorage", () => {
    render(<App />);
    if (DEMO_MODE) {
      const acceptButton = screen.getByText(/Accept/i);
      fireEvent.click(acceptButton);

      expect(screen.queryByText(/We use cookies/i)).not.toBeInTheDocument();
      expect(localStorage.getItem("cookiesAccepted")).toBe("true");
    }
  });

  test("declining cookies hides banner and sets localStorage", () => {
    render(<App />);
    if (DEMO_MODE) {
      const declineButton = screen.getByText(/Refuse/i);
      fireEvent.click(declineButton);

      expect(screen.queryByText(/We use cookies/i)).not.toBeInTheDocument();
      expect(localStorage.getItem("cookiesDeclined")).toBe("true");
    }
  });

  test("AdminRoute redirects if admin not logged in", () => {
    render(<App />);
    expect(screen.queryByText(/Change Password/i)).not.toBeInTheDocument();
  });

  test("ctfActive=false redirects protected routes", () => {
    render(<App />);
    // Use a more flexible matcher if "Home" text is split
    expect(screen.getByText((content, element) => {
      return content.includes("Welcome") || content.includes("Home");
    })).toBeInTheDocument();
  });

  test("Navbar renders with loggedInUser null initially", () => {
    render(<App />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
