import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getAuth, updateProfile } from "firebase/auth";

const AgentGuard = ({ children }) => {
  const [isAgentUser, setIsAgentUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth(); // Add this line to get the auth object

  useEffect(() => {
    const checkAgentStatus = async () => {
      const agentStatus = await isAgent(auth);
      setIsAgentUser(agentStatus);
    };

    checkAgentStatus();
  }, [auth]);

  // If isAgentUser is null, it means the check is still in progress.
  // If it's false, the user is not an agent and should be redirected.
  if (isAgentUser === false) {
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
