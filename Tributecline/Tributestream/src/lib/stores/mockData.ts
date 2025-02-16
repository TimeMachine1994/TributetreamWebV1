// Mock user data for testing without real authentication
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    displayName: 'Admin User',
    roles: ['administrator'],
    meta: {
      calculatorStatus: { completed: true }
    },
    password: 'admin123' // In real app, never store plain text passwords
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    displayName: 'Regular User',
    roles: ['subscriber'],
    meta: {
      calculatorStatus: { completed: false }
    },
    password: 'user123'
  },
  {
    id: 3,
    username: 'family',
    email: 'family@example.com',
    displayName: 'Family Member',
    roles: ['family'],
    meta: {
      calculatorStatus: { completed: true }
    },
    password: 'family123'
  }
];

// Mock authentication function
export function mockAuthenticate(username: string, password: string) {
  const user = mockUsers.find(u => u.username === username && u.password === password);
  if (user) {
    // Create a copy without the password field
    const { password: _, ...safeUser } = user;
    return {
      success: true,
      user: {
        ...safeUser,
        token: `mock-token-${user.id}` // Simulate JWT token
      }
    };
  }
  return {
    success: false,
    error: 'Invalid credentials'
  };
}

// Mock token validation
export function mockValidateToken(token: string) {
  const userId = parseInt(token.split('-')[2]);
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    const { password: _, ...safeUser } = user;
    return {
      success: true,
      user: {
        ...safeUser,
        token
      }
    };
  }
  return {
    success: false,
    error: 'Invalid token'
  };
}

// Mock user registration
export function mockRegister(userData: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}) {
  // Check if user already exists
  if (mockUsers.some(u => u.username === userData.username || u.email === userData.email)) {
    return {
      success: false,
      error: 'User already exists'
    };
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    username: userData.username,
    email: userData.email,
    displayName: userData.displayName,
    roles: ['subscriber'],
    meta: {
      calculatorStatus: { completed: false }
    },
    password: userData.password
  };

  mockUsers.push(newUser);

  const { password: _, ...safeUser } = newUser;
  return {
    success: true,
    user: {
      ...safeUser,
      token: `mock-token-${newUser.id}`
    }
  };
}