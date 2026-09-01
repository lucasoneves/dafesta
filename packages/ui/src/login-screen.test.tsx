import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginScreen } from "./login-screen.tsx";

describe("LoginScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título, subtítulo e botão de login quando não autenticado", () => {
    render(<LoginScreen onLogin={vi.fn()} onLogout={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Dafesta" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/organize suas festas e compartilhe listas/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /entrar com o google/i })
    ).toBeInTheDocument();
  });

  it("chama onLogin ao clicar no botão de login", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginScreen onLogin={onLogin} onLogout={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /entrar com o google/i })
    );

    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
  });

  it("desabilita o botão e mostra estado de carregamento enquanto onLogin pendente", async () => {
    let resolveLogin: () => void = () => {};
    const onLogin = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginScreen onLogin={onLogin} onLogout={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /entrar com o google/i })
    );

    expect(
      screen.getByRole("button", { name: /entrando/i })
    ).toBeDisabled();

    resolveLogin();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com o google/i })
      ).toBeEnabled()
    );
  });

  it("exibe mensagem de erro quando onLogin lança exceção", async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error("Falha de rede"));
    render(<LoginScreen onLogin={onLogin} onLogout={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /entrar com o google/i })
    );

    expect(await screen.findByText("Falha de rede")).toBeInTheDocument();
  });

  it("exibe informações do usuário e botão de sair quando autenticado", async () => {
    const onLogout = vi.fn().mockResolvedValue(undefined);
    const user = {
      displayName: "Ana Souza",
      email: "ana@example.com",
      photoURL: null,
    };

    render(
      <LoginScreen
        onLogin={vi.fn()}
        onLogout={onLogout}
        isAuthenticated
        user={user}
      />
    );

    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sair/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sair/i }));
    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
  });

  it("mostra estado de carregamento quando authLoading é verdadeiro", () => {
    render(<LoginScreen onLogin={vi.fn()} onLogout={vi.fn()} authLoading />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /entrar com o google/i })
    ).not.toBeInTheDocument();
  });

  it("exibe a imagem de branding quando imageUrl é fornecida", () => {
    render(
      <LoginScreen
        onLogin={vi.fn()}
        onLogout={vi.fn()}
        imageUrl="/dafesta-home-image.png"
      />
    );

    const img = screen.getByAltText("") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("/dafesta-home-image.png");
  });
});
