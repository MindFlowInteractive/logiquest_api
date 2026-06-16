import { Injectable, NotFoundException } from '@nestjs/common';

export interface Session {
  id: string;
  puzzleId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
}

@Injectable()
export class SessionsService {
  private sessions: Map<string, Session> = new Map();

  createSession(id: string, puzzleId: string): Session {
    const session: Session = { id, puzzleId, status: 'ACTIVE' };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  updateSessionStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED'): Session {
    const session = this.getSession(id);
    session.status = status;
    this.sessions.set(id, session);
    return session;
  }
}
