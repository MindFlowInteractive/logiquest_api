import { NFTAttribute } from "./nft-attribute.interface";

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    external_url?: string;
    attributes: NFTAttribute[];
    background_color?: string;
    animation_url?: string;
    youtube_url?: string;
    version: number;
    created_at: string;
    updated_at: string;
  }
  