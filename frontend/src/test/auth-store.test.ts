import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: true });
  });

  it("starts with default state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it("setUser updates user", () => {
    const testUser = { id: "1", name: "Test", email: "test@test.com", role: "STUDENT" as const };
    useAuthStore.getState().setUser(testUser);
    expect(useAuthStore.getState().user).toEqual(testUser);
  });

  it("setToken updates token", () => {
    useAuthStore.getState().setToken("test-token");
    expect(useAuthStore.getState().token).toBe("test-token");
  });

  it("setLoading updates loading state", () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("logout clears user and token", () => {
    useAuthStore
      .getState()
      .setUser({ id: "1", name: "Test", email: "test@test.com", role: "STUDENT" });
    useAuthStore.getState().setToken("test-token");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
