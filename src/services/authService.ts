interface User {
  username: string;
  isAuthenticated: boolean;
  role: 'admin' | 'standard';
}

const USERS = {
  admin: {
    username: 'Admin',
    password: 'I99thing',
    role: 'admin' as const
  },
  standard: {
    username: 'User',
    password: 'U99thing',
    role: 'standard' as const
  }
};

class AuthService {
  private static instance: AuthService;
  private user: User | null = null;

  private constructor() {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<boolean> {
    // Check admin credentials
    if (username === USERS.admin.username && password === USERS.admin.password) {
      this.user = {
        username,
        isAuthenticated: true,
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(this.user));
      return true;
    }
    
    // Check standard user credentials
    if (username === USERS.standard.username && password === USERS.standard.password) {
      this.user = {
        username,
        isAuthenticated: true,
        role: 'standard'
      };
      localStorage.setItem('user', JSON.stringify(this.user));
      return true;
    }

    return false;
  }

  public logout(): void {
    this.user = null;
    localStorage.removeItem('user');
  }

  public isAuthenticated(): boolean {
    return !!this.user?.isAuthenticated;
  }

  public getUser(): User | null {
    return this.user;
  }

  public isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

export default AuthService.getInstance(); 