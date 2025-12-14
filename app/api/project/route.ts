import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";

async function GET() {
  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json(
      { success: false, message: "Error with connecting to database." },
      { status: 500 } // code for internal db/server-side error
    );
  }

  try {
    const projects = Project.find();
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 } // code for empty collection
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Error retrieving projects from database" },
      { status: 500 } // code for internal db/server-side
    );
  }
}

export default GET;
