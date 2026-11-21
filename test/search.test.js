import assert from 'node:assert/strict';
import test from 'node:test';
import { submitSearch } from '../src/search.js';

for (const namespace of ['chrome', 'browser']) {
  test(`query goes through the ${namespace} API and never directly to a provider`, async () => {
    let provider = 'first';
    const calls = [];
    const api = { [namespace]: { search: { query: async payload => calls.push({ provider, ...payload }) } } };
    const navigate = () => assert.fail('search should not navigate to a hard-coded provider');
    await submitSearch('  آزمون TypeScript  ', api, navigate);
    provider = 'second';
    await submitSearch('switch provider', api, navigate);
    assert.deepEqual(calls, [
      { provider: 'first', text: 'آزمون TypeScript', disposition: 'CURRENT_TAB' },
      { provider: 'second', text: 'switch provider', disposition: 'CURRENT_TAB' },
    ]);
  });
}

test('an explicit URL or bare domain opens directly and blank input does nothing', async () => {
  const targets = [];
  const navigate = url => targets.push(url);
  await submitSearch(' https://example.com/path?q=1 ', {}, navigate);
  await submitSearch('sbc.om/work', {}, navigate);
  await submitSearch('   ', {}, navigate);
  assert.deepEqual(targets, ['https://example.com/path?q=1', 'https://sbc.om/work']);
});

test('missing or failing API does not fall back to any navigation', async () => {
  const navigate = () => assert.fail('unexpected navigation');
  await assert.rejects(submitSearch('query', {}, navigate), /unavailable/);
  await assert.rejects(submitSearch('query', { chrome: { search: { query: async () => { throw new Error('test failure'); } } } }, navigate), /test failure/);
});
