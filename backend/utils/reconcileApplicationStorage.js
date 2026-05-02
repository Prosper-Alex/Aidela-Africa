// Key feature: Keeps application records aligned when related storage fields change.
import mongoose from "mongoose";

const LEGACY_INDEX_NAME = "user_1_job_1";
const CURRENT_INDEX_NAME = "applicant_1_job_1";

export const reconcileApplicationStorage = async () => {
  const collection = mongoose.connection.collection("applications");

  if (!collection) {
    return;
  }

  await collection.updateMany(
    {
      $or: [{ applicant: { $exists: false } }, { applicant: null }],
      user: { $type: "objectId" },
    },
    [{ $set: { applicant: "$user" } }],
  );

  await collection.updateMany(
    {
      $or: [{ user: { $exists: false } }, { user: null }],
      applicant: { $type: "objectId" },
    },
    [{ $set: { user: "$applicant" } }],
  );

  const indexes = await collection.indexes();
  const hasLegacyIndex = indexes.some((index) => index.name === LEGACY_INDEX_NAME);

  if (hasLegacyIndex) {
    await collection.dropIndex(LEGACY_INDEX_NAME);
  }

  await collection.createIndex(
    { applicant: 1, job: 1 },
    {
      unique: true,
      name: CURRENT_INDEX_NAME,
      partialFilterExpression: {
        applicant: { $exists: true },
        job: { $exists: true },
      },
    },
  );
};
