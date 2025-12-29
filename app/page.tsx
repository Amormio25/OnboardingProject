"use client";
import { useState } from "react";
import Image from "next/image";
import ExperiencePage from "./api/experience/page";
import ProjectPage from "./api/project/page";

export default function Home() {
  const [activeView, setActiveView] = useState<
    "home" | "experiences" | "projects"
  >("home");

  return (
    <div className="h-screen w-screen overflow-auto bg-gray-50 sm:overflow-hidden md:overflow-hidden">
      {/* NAVBAR */}
      <div className="h-16 w-screen bg-slate-700 absolute flex justify-center items-center">
        <div className="text-white text-lg gap-4 flex font-semibold width: calc(0.5 * 100%);">
          <span
            onClick={() => setActiveView("home")}
            className="hover:font-semibold hover:cursor-pointer hover:bg-slate-800 p-2 rounded-md"
          >
            Home
          </span>
          <span
            onClick={() => setActiveView("experiences")}
            className="hover:font-semibold hover:cursor-pointer hover:bg-slate-800 p-2 rounded-md"
          >
            Experiences
          </span>
          <span
            onClick={() => setActiveView("projects")}
            className="hover:font-semibold hover:cursor-pointer hover:bg-slate-800 p-2 rounded-md"
          >
            Projects
          </span>
        </div>
      </div>

      <div className="m-8 flex h-[calc(100%-4rem)] w-[calc(100%-4rem)] flex-col items-center overflow-auto rounded-xl border bg-white p-8 pt-16 shadow-lg sm:overflow-hidden md:overflow-hidden">
        {/* HOME */}
        {activeView === "home" && (
          <>
            <h1 className="mt-12 mb-2 text-3xl font-semibold md:pt-0 md:text-5xl">
              About Me
            </h1>
            <h3 className="text-lg md:text-xl">Hi, I'm Amormio!</h3>
            <div className="grid h-full w-full grid-cols-1 items-center justify-items-center text-center md:grid-cols-[1fr_2fr_1fr]">
              <div id="intro" className="min-w-52 p-8 text-left">
                I'm a sophomore majoring in computer science and I've been
                trying to learn more web development over the past year. I'm
                passionate about learning and hope to become a software engineer
                in the future.
              </div>
              <Image
                src="/assets/images/selfpic.jpg"
                alt="self-pic"
                className="h-auto w-48 max-w-full rounded-full object-cover md:w-2/3 md:min-w-48"
                width={200}
                height={200}
                priority
              />
              <div id="interests" className="pb-8 pt-4 md:p-4">
                <h3 className="mb-4 text-xl font-semibold">My Interests</h3>
                <ul className="items-left flex min-w-52 list-disc flex-col text-center">
                  <li className="list-inside p-0">Playing guitar</li>
                  <li className="list-inside p-0">
                    Watching movies/shows/anime
                  </li>
                  <li className="list-inside p-0">Training Muay Thai</li>
                  <li className="list-inside p-0">
                    Playing/watching basketball
                  </li>
                  <li className="list-inside p-0">Web Dev</li>
                </ul>
              </div>
            </div>
          </>
        )}
        {/* EXPERIENCES */}
        {activeView === "experiences" && (
          <>
            <h1 className="mt-12 mb-2 text-3xl font-semibold md:pt-0 md:text-5xl">
              Experiences
            </h1>
            <ExperiencePage />
          </>
        )}
        {/* PROJECTS */}
        {activeView === "projects" && (
          <>
            <h1 className="mt-12 mb-2 text-3xl font-semibold md:pt-0 md:text-5xl">
              Projects
            </h1>
            <ProjectPage />
          </>
        )}
      </div>
    </div>
  );
}
