import mongoose from "mongoose";

const { Schema, model } = mongoose;
const MONGODB_URI = process.env.DATABASE_URL!;

// connect to connection string (NEVER USE ACTUAL STRING, USE VARIABLE NAME)
mongoose.connect(MONGODB_URI);

// create schema
const experienceSchema = new Schema({
  // String is shorthand for { type: String }
  // can do this when property only requires a type, unlike date
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: String,
});

experienceSchema.index(
  { company: 1, title: 1, startDate: 1 },
  { unique: true }
);

// create model, similar to making object using a class ctor
// check first if Experience model already exists in mongoose.models
//    reuse if yes, create if no
// this simply prevents errors when reloading (creating new model each time)
const Experience =
  mongoose.models.Experience || model("Experience", experienceSchema);
// const Experience = model("Experience", experienceSchema);

export default Experience;
