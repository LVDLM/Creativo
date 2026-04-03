export interface Challenge {
  id: string;
  title: string;
  description: string;
  example: string;
  category: string;
  icon?: string;
  difficulty?: 'Fácil' | 'Media' | 'Difícil' | 'Variable';
  duration?: string;
  color?: string;
  tags?: string[];
}

export interface Publication {
  id: string;
  challengeId: string;
  subTitle?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
  isModerated: boolean;
  likesCount?: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string;
  }
}
