"use client";
import { useEffect, useRef, useState } from "react";

// so it knows what type projects array is
interface Project {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  deploymentLink: string;
  githubLink: string;
}

export default function ProjectPage() {
  // projects is initially empty array with setter
  const [error, setError] = useState();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // abort previous pending request if user creates new request to prevent
  // a previous request returning after a more recent request
  const abortControllerRef = useRef<AbortController | null>(null);

  // useEffect with empty dependency array runs once after first
  // render (for data fetching)
  useEffect(() => {
    const url = "/api/project";
    const fetchExperiences = async () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true); // so user knows, in case fetch takes a while

      try {
        const response = await fetch(`${url}`, {
          signal: abortControllerRef.current?.signal,
        });
        const projects = await response.json(); // returns { success, data }
        setProjects(projects.data); // array of project objects
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
      {projects.map((project) => {
        console.log(project.endDate);
        const startDate = new Date(project.startDate);
        const endDate =
          project.endDate === undefined ? null : new Date(project.endDate);

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
            key={`${project.name}-${project.startDate}`}
          >
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <span className="text-gray-600 text-sm">
              {formattedStartDate} to{" "}
              {formattedEndDate === null ? "Present" : formattedEndDate}
            </span>
            <p className="pt-2 pb-2">{project.description}</p>
            <div className="flex flex-row gap-x-4 text-gray-600 text-sm hover:cursor-pointer">
              <a
                href={project.deploymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Live Demo
              </a>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
