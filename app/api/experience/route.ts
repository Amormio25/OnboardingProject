import Experience from "@/models/Experience";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const experienceValidationSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD.")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD.")
    .optional(),
  description: z.string().optional(),
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
      const experience = await Experience.findById(parsedId.data);
      if (!experience) {
        return NextResponse.json(
          { success: false, message: "Experience not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: experience },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Error occurred while retrieving experience from the database.",
        },
        { status: 500 }
      );
    }
  }

  // get all experiences
  try {
    const experiences = await Experience.find();
    return NextResponse.json(
      { success: true, data: experiences },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while retrieving experiences from database.",
      },
      { status: 500 }
    );
  }
}

async function POST(request: Request) {
  const connectionResponse = await connect();
  if (connectionResponse) return connectionResponse;

  const body = await request.json();
  const parsedBody = experienceValidationSchema.safeParse(body);
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
    const experience = await Experience.create(parsedBody.data);
    return NextResponse.json(
      {
        success: true,
        message: "New experience created.",
        data: experience,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This experience already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Error in creating new experience." },
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
    update: experienceValidationSchema.partial(),
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
    const updatedExperience = await Experience.findByIdAndUpdate(
      parsedRequest.data.id,
      parsedRequest.data.update,
      { new: true, runValidators: true }
    );
    if (!updatedExperience) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: updatedExperience,
        message: "Experience successfully updated.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while updating experience.",
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
    const experience = await Experience.findByIdAndDelete(parsedId.data);
    if (!experience) {
      return NextResponse.json(
        { success: false, message: "Experience not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Experience successfully deleted.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error occurred while deleting experience." },
      { status: 500 }
    );
  }
}
export { GET, POST, PUT, DELETE };
