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
import Results from "./pages/Results";
import AgentSignUp from "./pages/AgentSignUp";
import AgentSignIn from "./pages/AgentSignIn";
import Footer from "./components/Footer"
import AgentGuard from './components/AgentGuard';
import TermsAndServices from "./pages/TermsAndServices";
import Help from "./pages/Help";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import AgentVerificationPage from "./pages/AgentVerificationPage";
import SecondHeader from "./components/SecondHeader";
import Sell from "./pages/Sell";
import DiyListing from "./pages/DiyListing";
import AgentFinder from "./pages/AgentFinder";
import Profiled from "./pages/Profiled";


function App() {

  return (
    <>
      <Router>
        <HeaderWithCondition />
        <SecondHeaderWithCondition />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/profiled" element={<PrivateRoute />}>
            <Route path="/profiled" element={<Profiled />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/agent-sign-up" element={<AgentSignUp />} />
          <Route path="/agent-sign-in" element={<AgentSignIn />} />
          <Route path="/diylisting" element={<PrivateRoute />}>
            <Route path="/diylisting" element={<DiyListing />} />
          </Route>{" "}
          <Route path="/help" element={<Help />} />
          <Route
            path="/email-verification"
            element={<EmailVerificationPage />}
          />
          <Route
            path="/agent-verification"
            element={<AgentVerificationPage />}
          />
          <Route path="/terms-and-services" element={<TermsAndServices />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/results" element={<Results />} />
          <Route path="/agentfinder" element={<AgentFinder />} />
          <Route path="/listingdetails/:listingId" element={<Listing />} />
          <Route path="/create-listing" element={<PrivateRoute />}>
            <Route path="/create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/edit-listing" element={<PrivateRoute />}>
            <Route path="/edit-listing/:listingId" element={<EditListing />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        <FooterWithCondition />
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
    const shouldHideHeader = ["/sign-in", "/forgot-password", "/sign-up", "/agent-sign-up", "/agent-sign-in", "/results"].includes(currentPath);
    setHideHeader(shouldHideHeader);
  }, [navigate]);

  return hideHeader ? null : <Header />;
}

function FooterWithCondition() {
  const [hideFooter, setHideFooter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const shouldHideFooter = [
      "/sign-in",
      "/forgot-password",
      "/sign-up",
      "/agent-sign-up",
      "/agent-sign-in",
      "/create-listing",
      "/results",
      "/edit-listing",
      "/diylisting",
    ].includes(currentPath);
    setHideFooter(shouldHideFooter);
  }, [navigate]);

  return hideFooter ? null : <Footer />;
}
function SecondHeaderWithCondition() {
  const [showSecondHeader, setShowSecondHeader] = useState(false); // Invert initial state
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const shouldShowSecondHeader = ["/results"].includes(currentPath);
    setShowSecondHeader(shouldShowSecondHeader);
  }, [navigate]);

  return showSecondHeader ? <SecondHeader /> : null; // Render SecondHeader only when showSecondHeader is true
}



export default App;