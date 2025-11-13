import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { getUserDocument } from '../utils/firestore';
import Layout from '../components/Layout';
import ChatComponent from '../components/Chat';

function Chat() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      // Fetch user data from Firestore
      if (currentUser) {
        try {
          const data = await getUserDocument(currentUser.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Layout showCommandHint={false}>
      <div className="h-full">
        <ChatComponent
          username={user?.email?.split('@')[0]}
          userEmail={user?.email}
          userData={userData}
        />
      </div>
    </Layout>
  );
}

export default Chat;
