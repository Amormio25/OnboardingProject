"use client";
import exp from "constants";
import { abort } from "process";
import { useEffect, useRef, useState } from "react";

// so it knows what type experiences array is
interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ExperiencePage() {
  // experiences is initially empty array with setter
  const [error, setError] = useState();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // abort previous pending request if user creates new request to prevent
  // a previous request returning after a more recent request
  const abortControllerRef = useRef<AbortController | null>(null);

  // useEffect with empty dependency array runs once after first
  // render (for data fetching)
  useEffect(() => {
    const url = "/api/experience";
    const fetchExperiences = async () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true); // so user knows, in case fetch takes a while

      try {
        const response = await fetch(`${url}`, {
          signal: abortControllerRef.current?.signal,
        });
        const experiences = await response.json(); // returns { success, data }
        setExperiences(experiences.data); // array of experience objects
      } catch (error: any) {
        // don't want to set an error if the user canceled their request
        if (error.name === "AbortError") {
          console.log("Aborted");
          return;
        }

        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Something went wrong. Please try again.</div>;
  }
  return (
    <div className="testing">
      <h1 className="mb-4 text-2xl">Testing Data Fetching in React</h1>
      <ul>
        {experiences.map((experience) => (
          <li
            key={`${experience.company}-${experience.title}-${experience.startDate}`}
          >
            {experience.company}
            {experience.title}
            {experience.startDate}
            {experience.endDate}
            {experience.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
