import { linearRelease } from './linear-release';

describe('linearRelease', () => {
  it('should work', () => {
    expect(linearRelease()).toEqual('linear-release');
  });
});
