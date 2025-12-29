"use client";
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

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
    timeZone: "UTC", // Force UTC formatting, avoiding change by local timezone
  };

  return (
    <div className="box-border w-full grid grid-cols-[repeat(auto-fill,minmax(325px,1fr))] gap-8 p-8 overflow-auto">
      {experiences.map((experience) => {
        console.log(experience.endDate);
        const startDate = new Date(experience.startDate);
        const endDate =
          experience.endDate === undefined
            ? null
            : new Date(experience.endDate);

        const formattedStartDate = startDate.toLocaleDateString(
          "en-US",
          options
        );
        const formattedEndDate =
          endDate === null
            ? null
            : endDate.toLocaleDateString("en-US", options);

        return (
          <div
            className="flex flex-col"
            key={`${experience.company}-${experience.title}-${experience.startDate}`}
          >
            <h1 className="text-2xl font-semibold">{experience.company}</h1>
            <h2 className="text-base text-gray-700">{experience.title}</h2>
            <span className="text-gray-600 text-sm">
              {formattedStartDate} to{" "}
              {formattedEndDate === null ? "Present" : formattedEndDate}
            </span>
            <p className="pt-2 pb-2">{experience.description}</p>
          </div>
        );
      })}
    </div>
  );
}
