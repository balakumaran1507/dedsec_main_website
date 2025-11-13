import Layout from '../components/Layout';
import DashboardHome from '../components/DashboardHome';
import { auth } from '../utils/firebase';
import { useState, useEffect } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <DashboardHome user={user} />
      </div>
    </Layout>
  );
}

export default Dashboard;