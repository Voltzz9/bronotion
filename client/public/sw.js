self.addEventListener("push", (event) => {
    try {
        const data = event.data.json();
        const title = data.title || 'New Notification';
        const body = data.body || '';
        const icon = data.icon || '/default-icon.png';
        const notificationOptions = {
            body: body,
            icon: icon,
        };
        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
        );
    } catch (error) {
        console.error('Error showing notification:', error);
    }
});