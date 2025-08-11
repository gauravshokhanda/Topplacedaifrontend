// Auto-refresh dashboard data every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh user stats, recent interviews, etc.
  }, 30000);
  return () => clearInterval(interval);
}, []);