import Experience from "@/models/Experience";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { success, z } from "zod";
import { parse } from "path";
import exp from "constants";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
async function GET(request: Request) {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json(
      { success: false, message: "Error with connecting to database." },
      { status: 500 } // code for internal db/server-side error
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // get experience by id
  if (id) {
    const parsedId = objectIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
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
          message: "Error retrieving experience from the database.",
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
      { status: 200 } // code for empty collection
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Error retrieving experiences from database" },
      { status: 500 } // code for internal db/server-side
    );
  }
}

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

async function POST(request: Request) {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json(
      { success: false, message: "Error with connecting to database." },
      { status: 500 } // code for internal db/server-side error
    );
  }

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
export { GET, POST };
