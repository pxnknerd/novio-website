import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getAuth, updateProfile } from "firebase/auth";

const AgentGuard = ({ children }) => {
  const [isAgentUser, setIsAgentUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth(); // Add this line to get the auth object

  useEffect(() => {
    const checkAgentStatus = async () => {
      const agentStatus = await isAgent(auth);

      // Fetch user status
      const userDocRef = doc(db, 'agents', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists) {
        // Assuming the user status is stored as a field named "status"
        const status = userDoc.data().status;
        setUserStatus(status);
      } else {
        // Handle the case where the user document doesn't exist
        setUserStatus(null);
      }

      setIsAgentUser(agentStatus);
    };

    checkAgentStatus();
  }, [auth]);

  // If isAgentUser is null or userStatus is not approved, redirect to home.
  if (isAgentUser === false || userStatus !== 'approved') {
    navigate('/');
    return null;
  }

  // If isAgentUser is true or still in progress, render the children.
  return <>{children}</>;
};

const isAgent = async (auth) => {
  const agentDocRef = doc(db, "agents", auth.currentUser.uid);
  const agentDoc = await getDoc(agentDocRef);
  return agentDoc.exists();
};

export default AgentGuard;
