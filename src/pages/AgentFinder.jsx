import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { GrNext } from "react-icons/gr";
import { Link } from "react-router-dom"; 

export default function AgentFinder() {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(""); // New state for selected language

  const [selectedCity, setSelectedCity] = useState(""); // New state for selected city
  const MoroccanCities = [
    "Agadir",
    "Al Hoceima",
    "Azemmour",
    "Beni Mellal",
    "Boujdour",
    "Casablanca",
    "Chefchaouen",
    "Dakhla",
    "El Jadida",
    "Erfoud",
    "Essaouira",
    "Fes",
    "Fnideq",
    "Guelmim",
    "Ifrane",
    "Kénitra",
    "Khouribga",
    "Laayoune",
    "Larache",
    "Marrakech",
    "Meknes",
    "Mohammedia",
    "Nador",
    "Ouarzazate",
    "Oujda",
    "Rabat",
    "Safi",
    "Salé",
    "Tangier",
    "Taza",
    "Tétouan",
    "Tiznit",
  ];
  useEffect(() => {
    async function fetchAgents() {
      try {
        const agentsCollection = collection(db, "agents");
        const agentsSnapshot = await getDocs(agentsCollection);

        const agentsData = [];
        agentsSnapshot.forEach((doc) => {
          const agent = { id: doc.id, ...doc.data() };

          // Check if the agent has an approved status
          if (agent.status === "approved") {
            agentsData.push(agent);
          }
        });

        setAgents(agentsData);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    }

    fetchAgents();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const filteredAgents = agents.filter((agent) => {
    const nameMatch = `${agent.firstName} ${agent.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const cityMatch =
      selectedCity === "" ||
      (agent.selectedCities && agent.selectedCities.includes(selectedCity));
    const languageMatch =
      selectedLanguage === "" ||
      (agent.selectedLanguages &&
        agent.selectedLanguages.includes(selectedLanguage));

    return nameMatch && cityMatch && languageMatch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <p className="font-semibold mb-4 mt-4 text-2xl md:text-4xl">
        Real Estate Agents in {selectedCity ? selectedCity : "Morocco"}
      </p>
      <div className="sm:flex p-4 rounded sm:p-8 gap-4 bg-gray-100 mb-8">
        {" "}
        <div className="w-full">
          <p className="mb-1 font-semibold">Name</p>
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded"
          />
        </div>
        <div className="mt-4 sm:mt-0 flex w-full gap-4">
          <div className="w-full">
            <p className="mb-1 font-semibold">Location</p>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 rounded"
            >
              <option value="">All</option>
              {MoroccanCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>{" "}
          <div className=" w-full ">
            <p className="mb-1 font-semibold">Language</p>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded"
            >
              <option value="">All </option>
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Arabic">Arabic</option>
              <option value="Tamazight">Tamazight</option>
            </select>
          </div>
        </div>
      </div>
      {filteredAgents.length === 0 ? (
        <p className="sm:text-xl text-center mb-4">
          Sorry, we couldn't find any agents matching your criteria.
        </p>
      ) : (
        <ul>
          {filteredAgents.map((agent) => (
            <li
              key={agent.id}
              className="flex rounded  bg-gray-100  mb-4 p-4 sm:p-8 items-center transform transition-all ease-in-out duration-150 "
            >
              <img
                src={agent.photoURL ? agent.photoURL : "/anonym.png"}
                alt={`Profile of ${agent.firstName} ${agent.lastName}`}
                className="h-16 w-16 sm:h-20 sm:w-20 mb-2 rounded-full object-cover"
              />
              <div className="flex-col px-8 w-full">
                <Link
                  to={`/agent/${agent.id}`}
                  className="sm:text-xl hover:text-red-700 hover:underline font-semibold"
                >{`${agent.firstName} ${agent.lastName}`}</Link>
                <a
                  href={`tel:${agent.phoneNumber}`}
                  className="flex text-sm md:text-lg w-full"
                >
                  {agent.phoneNumber}
                </a>
                <p className="text-sm sm:text-md font-light opacity-50">
                  {agent.agency}
                </p>
              </div>
              <Link
                to={`/agent/${agent.id}`}
                className="flex text-2xl md:text-4xl w-full hover:text-red-700 justify-end"
              >
                <GrNext />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
