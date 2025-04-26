import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private readonly apiUrl: string;
  private readonly gateway: string;
  private readonly auth: { username: string; password: string };

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('ipfs.apiUrl');
    this.gateway = this.configService.get<string>('ipfs.gateway');
    this.auth = {
      username: this.configService.get<string>('ipfs.projectId'),
      password: this.configService.get<string>('ipfs.projectSecret'),
    };
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', Buffer.from(JSON.stringify(data)), {
        filename: 'metadata.json',
        contentType: 'application/json',
      });

      const response = await axios.post(`${this.apiUrl}/add`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        auth: this.auth,
      });

      const responseData = response.data as IPFSResponse;

      if (!responseData || !responseData.Hash) {
        throw new Error('Failed to get hash from IPFS response');
      }

      return responseData.Hash;
    } catch (error: any) {
      this.logger.error(`Error uploading to IPFS: ${error.message}`, error.stack);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: 'image/png',
      });

      const response = await axios.post(`${this.apiUrl}/add`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        auth: this.auth,
      });

      const responseData = response.data as IPFSResponse;

      if (!responseData || !responseData.Hash) {
        throw new Error('Failed to get hash from IPFS response');
      }

      return responseData.Hash;
    } catch (error: any) {
      this.logger.error(`Error uploading image to IPFS: ${error.message}`, error.stack);
      throw new Error(`Failed to upload image to IPFS: ${error.message}`);
    }
  }

  getIpfsUrl(hash: string): string {
    return `${this.gateway}/${hash}`;
  }

  async isAvailable(hash: string): Promise<boolean> {
    try {
      const response = await axios.head(`${this.gateway}/${hash}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
