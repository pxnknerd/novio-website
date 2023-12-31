import {BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom"
import { useEffect, useState } from "react";
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import PrivateRoute from "./components/PrivateRoute"
import Offers from "./pages/Offers"
import ForgotPassword from "./pages/ForgotPassword"
import Header from "./components/Header"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import CreateListing from "./pages/CreateListing"
import Listing from "./pages/Listing"
import EditListing from "./pages/EditListing";
import Category from "./pages/Category";
import AgentSignUp from "./pages/AgentSignUp";
import AgentSignIn from "./pages/AgentSignIn";
import Footer from "./components/Footer"
import AgentGuard from './components/AgentGuard';

function App() {

  return (
    <>
      <Router>
        <HeaderWithCondition/>
        <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRoute/>}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/agent-sign-up" element={<AgentSignUp />} />
          <Route path="/agent-sign-in" element={<AgentSignIn />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/category/:categoryName/:listingId" element={<Listing />}/>
          <Route path="/create-listing" element={<PrivateRoute/>}>
          <Route path="/create-listing" element={<AgentGuard> <CreateListing /> </AgentGuard>} />
          </Route>
          <Route path="/edit-listing" element={<PrivateRoute/>}>
          <Route path="/edit-listing/:listingId" element={<EditListing />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPassword />} />
       </Routes>
       </div>
       <FooterWithCondition/>
      </Router>
      <ToastContainer
position="bottom-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
/>
     </>
  );
}

function HeaderWithCondition() {
  const [hideHeader, setHideHeader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const shouldHideHeader = ["/sign-in", "/forgot-password", "/sign-up", "/agent-sign-up", "/agent-sign-in"].includes(currentPath);
    setHideHeader(shouldHideHeader);
  }, [navigate]);

  return hideHeader ? null : <Header />;
}

function FooterWithCondition() {
  const [hideFooter, setHideFooter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const shouldHideFooter = ["/sign-in", "/forgot-password", "/sign-up", "/agent-sign-up", "/agent-sign-in", "/create-listing"].includes(currentPath);
    setHideFooter(shouldHideFooter);
  }, [navigate]);

  return hideFooter ? null : <Footer />;
}

export default App;