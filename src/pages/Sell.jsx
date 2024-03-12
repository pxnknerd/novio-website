import React from "react";
import { useNavigate } from "react-router";


export default function Sell() {
    const navigate = useNavigate();

  return (
    <div className="bg-white">
      <div className="mx-auto p-8 max-w-6xl ">
        <h1 className="Items-center text-center mt-12 mb-2 text-4xl">
          Choose your desired option
        </h1>
        <h2 className="text-center mb-24  ">
          At Beytty, we empower you to list your property your way - Your
          property, your choice.
        </h2>
        <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
          <li
            className="cursor-pointer hover:shadow-2xl shadow-md px-8 flex flex-col rounded-lg bg-white transition duration-300"
            onClick={() => navigate("/diylisting")}
          >
            <div>
              <h1 className="mt-8  text-2xl mb-8 font-semibold">
                List with Beytty.
              </h1>
            </div>
            <ul className="mb-8">
              <div>
                <li className="mt-4 font-semibold">Effortless Process</li>{" "}
                <p>Our expert agents take care of everything.</p>
              </div>
              <li className="mt-2 font-semibold">Professional Content</li>
              <p>
                {" "}
                We ensure your property shines with high-quality visuals and
                engaging descriptions.
              </p>
            </ul>

            <button
              type="button"
              className="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
            >
              List with Beytty
            </button>
          </li>
          <li
            className="cursor-pointer hover:shadow-2xl shadow-md px-8  flex flex-col rounded-lg bg-white transition duration-300"
            onClick={() => navigate("/agentfinder")}
          >
            <h1 className="mt-8 text-2xl mb-8 font-semibold">
              List with Agent.
            </h1>
            <ul className="mb-4">
              <li className="mt-4 font-semibold">Personal Connection</li>{" "}
              <p>
                Select an agent you trust and feel comfortable working with.
              </p>
              <li className="mt-2 font-semibold">Showcasing Excellence</li>
              <p> Benefit from professional photos and captivating content.</p>
            </ul>

            <button
              type="button"
              className="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
              à
            >
              List with Agent
            </button>
          </li>
          <li
            className="cursor-pointer hover:shadow-2xl shadow-md px-8 flex flex-col rounded-lg bg-white transition duration-300"
            onClick={() => navigate("/create-listing")}
          >
            <h1 className="mt-8 text-2xl mb-8 font-semibold">
              List It Yourself.
            </h1>
            <ul className="mb-4">
              <li className="mt-4 font-semibold">DIY Freedom</li>{" "}
              <p>Sell your way, on your terms.</p>
              <li className="mt-2 font-semibold">Cost-effective</li>
              <p> No agent commission fees, maximizing your profits.</p>
            </ul>

            <button
              type="button"
              className="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
            >
              List by myself
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
