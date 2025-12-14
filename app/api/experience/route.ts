import Experience from "@/models/Experience";
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
    const experiences = Experience.find();
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

export default GET;
