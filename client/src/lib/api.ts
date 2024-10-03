const API_BASE_URL = 'https://localhost:8080';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    username?: string; // Add this line
  }

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Error fetching user');
    }
    const data: User = await response.json();
    console.log('User data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}  

export async function createUser(user: User): Promise<User> {
try {
    // Generate a username if it's not provided
    const userData = {
    ...user,
    username: user.username || user.email.split('@')[0],
    };

    const response = await fetch(`${API_BASE_URL}/create_user`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
    });
    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error creating user: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }
    const data: User = await response.json();
    console.log('User created:', data);
    return data;
} catch (error) {
    console.error('Error creating user:', error);
    throw error;
}
}