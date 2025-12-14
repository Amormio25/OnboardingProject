import mongoose from "mongoose";

const { Schema, model } = mongoose;
const MONGODB_URI = process.env.DATABASE_URL!;

// connect to connection string (NEVER USE ACTUAL STRING, USE VARIABLE NAME)
mongoose.connect(MONGODB_URI);

// create schema
const projectSchema = new Schema({
  // String is shorthand for { type: String }
  // can do this when property only requires a type, unlike date
  name: String,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  description: String,
  deploymentLink: String,
  githubLink: String,
});

// create model, similar to making object using a class ctor
const Project = model("Project", projectSchema);

export default Project;
