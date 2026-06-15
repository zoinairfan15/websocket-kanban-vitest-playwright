import { test, expect } from "@playwright/test";

test.describe("Kanban Board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("[data-testid='kanban-board']", { timeout: 10000 });
  });

  test("shows page title", async ({ page }) => {
    await expect(page.getByText("Real-time Kanban Board")).toBeVisible();
  });

  test("shows all three columns", async ({ page }) => {
    await expect(page.getByTestId("column-todo")).toBeVisible();
    await expect(page.getByTestId("column-inprogress")).toBeVisible();
    await expect(page.getByTestId("column-done")).toBeVisible();
  });

  test("user can create a task", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    await page.getByTestId("task-title-input").fill("My E2E Task");
    await page.getByTestId("submit-task-btn").click();
    await expect(page.getByText("My E2E Task")).toBeVisible({ timeout: 5000 });
  });

  test("user can delete a task", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    await page.getByTestId("task-title-input").fill("Task to Delete");
    await page.getByTestId("submit-task-btn").click();
    await page.waitForSelector("text=Task to Delete");
    const card = page.locator("[data-testid^='task-card-']").filter({ hasText: "Task to Delete" });
    await card.locator("[data-testid^='delete-task-']").click();
    await expect(page.getByText("Task to Delete")).not.toBeVisible({ timeout: 5000 });
  });

  test("user can select priority", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    await page.getByTestId("priority-select").selectOption("High");
    await expect(page.getByTestId("priority-select")).toHaveValue("High");
  });

  test("user can select category", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    await page.getByTestId("category-select").selectOption("Bug");
    await expect(page.getByTestId("category-select")).toHaveValue("Bug");
  });

  test("invalid file upload shows error", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByTestId("file-input").click(),
    ]);
    await fileChooser.setFiles({
      name: "bad.exe",
      mimeType: "application/x-msdownload",
      buffer: Buffer.from("fake"),
    });
    await expect(page.getByTestId("file-error")).toBeVisible();
  });

  test("valid image upload shows preview", async ({ page }) => {
    await page.getByTestId("add-task-btn").click();
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByTestId("file-input").click(),
    ]);
    const buf = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    await fileChooser.setFiles({ name: "test.png", mimeType: "image/png", buffer: buf });
    await expect(page.locator(".kb-att-img")).toBeVisible();
  });

  test("progress chart is visible", async ({ page }) => {
    await expect(page.getByTestId("progress-chart")).toBeVisible();
    await expect(page.getByTestId("completion-percent")).toBeVisible();
  });
});