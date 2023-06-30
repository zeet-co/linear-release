import { getPullRequestsFromText, linearRelease } from './linear-release';

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
