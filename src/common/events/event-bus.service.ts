import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

/**
 * Simple internal event bus used for cross‑module communication.
 * Extends Node's EventEmitter – no external dependencies needed.
 */
@Injectable()
export class EventBusService extends EventEmitter {}
