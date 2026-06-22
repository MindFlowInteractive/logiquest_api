import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventName } from './events.enum';

@Injectable()
export class EventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<T>(event: EventName, payload: T): void {
    this.eventEmitter.emit(event, payload);
  }
}
