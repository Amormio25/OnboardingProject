import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const projectValidationSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD.")
    .optional(),
  description: z.string().optional(),
  deploymentLink: z.string().url("Invalid URL format.").optional(),
  githubLink: z.string().url("Invalid URL format.").optional(),
});

async function connect() {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json(
      { success: false, message: "Error with connecting to database." },
      { status: 500 }
    );
  }
}

async function GET(request: Request) {
  const connectionResponse = await connect();
  if (connectionResponse) return connectionResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const parsedId = objectIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
          errors: parsedId.error.format(),
        },
        { status: 400 }
      );
    }
    try {
      const project = await Project.findById(parsedId.data);
      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: project },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Error occurred while retrieving project from the database.",
        },
        { status: 500 }
      );
    }
  }

  // get all projects
  try {
    const projects = await Project.find();
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while retrieving projects from database.",
      },
      { status: 500 }
    );
  }
}

async function POST(request: Request) {
  const connectionResponse = await connect();
  if (connectionResponse) return connectionResponse;

  const body = await request.json();
  const parsedBody = projectValidationSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body.",
        errors: parsedBody.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const project = await Project.create(parsedBody.data);
    return NextResponse.json(
      {
        success: true,
        message: "New project created.",
        data: project,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This project already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Error in creating new project." },
      { status: 500 }
    );
  }
}

async function PUT(request: Request) {
  const connectionResponse = await connect();
  if (connectionResponse) return connectionResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();

  const validator = z.object({
    id: objectIdSchema,
    update: projectValidationSchema.partial(),
  });
  const parsedRequest = validator.safeParse({ id: id, update: body });
  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body.",
        errors: parsedRequest.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      parsedRequest.data.id,
      parsedRequest.data.update,
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: updatedProject,
        message: "Project successfully updated.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while updating project.",
      },
      { status: 500 }
    );
  }
}

async function DELETE(request: Request) {
  const connectionResponse = await connect();
  if (connectionResponse) return connectionResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing 'id' query parameter." },
      { status: 400 }
    );
  }

  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
        errors: parsedId.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const project = await Project.findByIdAndDelete(parsedId.data);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Project successfully deleted.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error occurred while deleting project." },
      { status: 500 }
    );
  }
}
export { GET, POST, PUT, DELETE };
