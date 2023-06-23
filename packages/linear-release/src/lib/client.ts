import { LinearClient, LinearFetch, User } from '@linear/sdk';
import config from './config';

const linearClient = new LinearClient({ apiKey: config.linearApiKey });

async function getCurrentUser(): LinearFetch<User> {
  return linearClient.viewer;
}
