import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the generated Next.js starter content", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /to get started, edit the page\.tsx file/i,
      }),
    ).toBeInTheDocument();
  });
});
