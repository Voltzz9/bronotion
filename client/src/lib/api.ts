const API_BASE_URL = 'https://localhost:8080';

export async function getUserById(userId: string): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('User data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}