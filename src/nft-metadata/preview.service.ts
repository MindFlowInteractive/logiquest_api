import { Injectable, Logger } from '@nestjs/common';
import { NFTMetadata } from './interfaces/nft-metadata.interface';
import * as sharp from 'sharp';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  async generatePreviewImage(metadata: NFTMetadata): Promise<Buffer> {
    try {
      // Fetch the image from the URL
      const imageResponse = await fetch(metadata.image);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      
      // Create a preview with the metadata information overlaid
      const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="${metadata.background_color || '#f0f0f0'}"/>
        <text x="600" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#000000">${metadata.name}</text>
        <text x="600" y="150" font-family="Arial" font-size="30" text-anchor="middle" fill="#666666">${metadata.description.substring(0, 100)}${metadata.description.length > 100 ? '...' : ''}</text>
        <foreignObject x="300" y="200" width="600" height="400">
          <body xmlns="http://www.w3.org/1999/xhtml">
            <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">
              <img src="data:image/png;base64,${imageBuffer.toString('base64')}" style="max-width:100%;max-height:100%;"/>
            </div>
          </body>
        </foreignObject>
      </svg>`;
      
      // Convert SVG to PNG using sharp
      return await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
    } catch (error) {
      this.logger.error(`Error generating preview: ${error.message}`, error.stack);
      // Return a fallback image
      return await sharp({
        create: {
          width: 1200,
          height: 630,
          channels: 4,
          background: { r: 240, g: 240, b: 240, alpha: 1 }
        }
      })
      .png()
      .toBuffer();
    }
  }
}
