import { EventEmitter } from 'events';

// Create a globally shared event emitter for instant inter-component local communication
export const eventBus = new EventEmitter();
