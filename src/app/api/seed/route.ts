import postgres from "postgres";
import { advocateData, createRandomRecords } from "../../../db/seed/advocates";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "cannot seed db in production" });
  }
  const sql = postgres(process.env.DATABASE_URL!);
  const dataToInsert = [...advocateData, ...createRandomRecords(1000)];

  try {
    const records = await sql`
      INSERT INTO advocates ${sql(
        dataToInsert.map((advocate) => ({
          first_name: advocate.firstName,
          last_name: advocate.lastName,
          city: advocate.city,
          degree: advocate.degree,
          specialties: advocate.specialties,
          years_of_experience: advocate.yearsOfExperience,
          phone_number: advocate.phoneNumber,
        }))
      )}
      RETURNING *
    `;

    await sql.end();
    return Response.json({ advocates: records });
  } catch (error) {
    await sql.end();
    throw error;
  }
}
