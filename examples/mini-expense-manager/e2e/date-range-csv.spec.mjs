import { test, expect } from '@playwright/test';

test('filters inclusively and downloads only matching CSV rows', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#expenses tr')).toHaveCount(3);
  await page.locator('#start-date').fill('2026-04-15');
  await page.locator('#end-date').fill('2026-04-30');
  await expect(page.locator('#expenses tr')).toHaveCount(2);
  await expect(page.locator('#expenses')).toContainText('Team lunch');
  await expect(page.locator('#expenses')).toContainText('Transit');
  await expect(page.locator('#expenses')).not.toContainText('Coffee');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('expenses.csv');
});

test('reports inverted range while preserving current rows', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-date').fill('2026-04-15');
  await expect(page.locator('#expenses tr')).toHaveCount(2);
  await page.locator('#end-date').fill('2026-04-01');
  await expect(page.getByRole('alert')).toContainText('Start date must be on or before end date');
  await expect(page.locator('#expenses tr')).toHaveCount(2);
});
