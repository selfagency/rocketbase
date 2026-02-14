import { test as base } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const COVERAGE_ENABLED = process.env.PLAYWRIGHT_COVERAGE === '1';
const COVERAGE_DIR = join(process.cwd(), 'coverage', 'e2e-playwright');

export const test = base.extend({
  page: async ({ page, browserName }, use, testInfo) => {
    const shouldCollect = COVERAGE_ENABLED && browserName === 'chromium';

    if (shouldCollect) {
      await page.coverage.startJSCoverage({
        resetOnNavigation: false,
        reportAnonymousScripts: true,
      });
      await page.coverage.startCSSCoverage({
        resetOnNavigation: false,
      });
    }

    await use(page);

    if (!shouldCollect) {
      return;
    }

    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);

    const safeName = `${testInfo.titlePath.join(' > ').replace(/[^a-zA-Z0-9-_]+/g, '_')}-${testInfo.retry}`;
    await mkdir(COVERAGE_DIR, { recursive: true });
    await writeFile(
      join(COVERAGE_DIR, `${safeName}.json`),
      JSON.stringify(
        {
          testId: testInfo.testId,
          file: testInfo.file,
          title: testInfo.title,
          project: testInfo.project.name,
          jsCoverage,
          cssCoverage,
        },
        null,
        2
      ),
      'utf8'
    );
  },
});

export { expect } from '@playwright/test';
