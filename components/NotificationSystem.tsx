// Poll for new notifications every minute
useEffect(() => {
  const interval = setInterval(async () => {
    const newNotifications = await fetchNotifications();
    setNotifications(newNotifications);
  }, 60000);
  return () => clearInterval(interval);
}, []);