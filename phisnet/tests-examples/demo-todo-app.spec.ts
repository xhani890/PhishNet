import { test, expect } from '@playwright/test';

test.describe('Demo Todo App', () => {
    test('should add a new task', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.fill('input[name="task"]', 'New Task');
        await page.click('button[type="submit"]');
        const task = await page.locator('text=New Task');
        await expect(task).toBeVisible();
    });

    test('should remove a task', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.fill('input[name="task"]', 'Task to Remove');
        await page.click('button[type="submit"]');
        await page.click('button.delete'); // Assuming there's a delete button
        const task = await page.locator('text=Task to Remove');
        await expect(task).not.toBeVisible();
    });
});