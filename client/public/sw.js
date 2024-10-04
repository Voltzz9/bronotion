self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title;
    const body = data.body;
    const icon = data.icon;

    const notificationOptions = {
        body: body,
        icon: icon,
    };

    self.registration.showNotification(title, notificationOptions);
});