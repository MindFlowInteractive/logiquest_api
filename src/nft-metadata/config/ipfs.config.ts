import { registerAs } from '@nestjs/config';

export default registerAs('ipfs', () => ({
  apiUrl: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0',
  gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs',
  projectId: process.env.IPFS_PROJECT_ID,
  projectSecret: process.env.IPFS_PROJECT_SECRET,
}));