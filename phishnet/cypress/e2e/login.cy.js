describe("Login Page", () => {
  it("Should allow a user to login", () => {
    cy.visit("/"); // Open homepage
    cy.get("input[name='email']").type("test@example.com"); // Enter email
    cy.get("input[name='password']").type("password123"); // Enter password
    cy.get("button[type='submit']").click(); // Click login button
    cy.url().should("include", "/dashboard"); // Check redirect
  });
});
