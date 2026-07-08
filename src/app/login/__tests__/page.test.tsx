import { render, screen } from "@testing-library/react";
import LoginPage from "../page";

// Mock Zustand store
jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    login: jest.fn(),
  }),
}));

describe("Login Page", () => {
  it("renders login page", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });
});