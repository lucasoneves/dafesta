import { test, expect } from "@playwright/test";

test.describe("Tela de Login (interface)", () => {
  test("renderiza o branding, título e CTA do Google", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Dafesta" })
    ).toBeVisible();

    await expect(
      page.getByText(/organize suas festas e compartilhe listas/i)
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /entrar com o google/i })
    ).toBeVisible();
  });

  test("botão de login fica disponível e clicável", async ({ page }) => {
    await page.goto("/");

    const cta = page.getByRole("button", { name: /entrar com o google/i });
    await expect(cta).toBeEnabled();
  });
});

test.describe("Dashboard", () => {
  test("exibe o cabeçalho e o título do painel", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Seus eventos" })
    ).toBeVisible();
  });
});
