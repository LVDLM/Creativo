export interface Challenge {
  id: string;
  title: string;
  description: string;
  example: string;
  category: string;
  icon?: string;
}

export interface Publication {
  id: string;
  challengeId: string;
  subTitle?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  isModerated: boolean;
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
