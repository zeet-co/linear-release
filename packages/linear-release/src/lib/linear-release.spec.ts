import {
  getPullRequestsFromText,
  linearRelease,
  extractLinearIdsFromText,
} from './linear-release';

describe('linearRelease', () => {
  it('should work', () => {
    expect(linearRelease()).toEqual('linear-release');
  });
});

describe('pullRequestRegex', () => {
  it('should work', () => {
    const testCases = [
      {
        text: 'Merge pull request #123 from zeet-co/feature/ZEET-1234',
        expected: [123],
      },
      {
        text: '[ZEET-2396] Add v1 graphql for cluster revisions (#825)',
        expected: [825],
      },
    ];

    for (const testCase of testCases) {
      const pullRequests = getPullRequestsFromText(testCase.text);
      expect(pullRequests).toEqual(testCase.expected);
    }
  });
});

describe('extractLinearIdsFromText', () => {
  it('should work', () => {
    const testCases = [
      {
        text: `https://linefasdfasf321231222-5`,
        expected: [],
      },
      {
        text: `https://linear.app/zeet/issue/ZEET-2607/create-e2e-test-for-prometheus-kubernetes-22-5`,
        expected: ['ZEET-2607'],
      },
      {
        text: `<p><a href="https://linear.app/zeet/issue/ZEET-2607/create-e2e-test-for-prometheus-kubernetes-22-5">ZEET-2607 Create e2e test for prometheus-kubernetes-22-5</a></p>
        <p><a href="https://linear.app/zeet/issue/ZEET-2606/create-e2e-test-for-prometheus-kubernetes-15-10">ZEET-2606 Create e2e test for prometheus-kubernetes-15-10</a></p>
        <p><a href="https://linear.app/zeet/issue/ZEET-2605/create-e2e-test-for-prometheus-kubernetes-14-4">ZEET-2605 Create e2e test for prometheus-kubernetes-14-4</a></p>`,
        expected: ['ZEET-2605', 'ZEET-2606', 'ZEET-2607'],
      },
    ];

    for (const testCase of testCases) {
      const ids = extractLinearIdsFromText(testCase.text);
      expect(ids.sort()).toEqual(testCase.expected.sort());
    }
  });
});
