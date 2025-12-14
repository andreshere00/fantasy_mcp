// interfaces/cli/main.ts

import { ConsoleUserContext } from '../../infrastructure/fantasy/userContext/userInformation.js';
import { getUserContextSnapshot } from '../../application/fantasy/userContext/getUserContext.js';

async function main(): Promise<void> {
  const consoleContext = new ConsoleUserContext();

  try {
    const userContext = await getUserContextSnapshot({
      balance: consoleContext,
      squad: consoleContext,
      market: consoleContext,
      opponents: consoleContext,
    });

    // Next step: feed this into your lineup builder use-case
    console.log('\nUser context snapshot:\n', JSON.stringify(userContext, null, 2));
  } catch (err) {
    console.error('CLI failed:', err);
  } finally {
    await consoleContext.close();
  }
}

void main();