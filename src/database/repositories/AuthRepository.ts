export interface AuthRepository {
  getSession(): Promise<any>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthStateChange(callback: (event: string, session: any) => void): void;
  inviteUser(email: string, metadata: any): Promise<void>;
}
