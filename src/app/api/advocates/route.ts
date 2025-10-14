import { and, or, ilike, gte, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: Request) {
  // Extract query parameters
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const specialtiesParam = url.searchParams.get("specialties");
  const specialties = specialtiesParam
    ? specialtiesParam.split(",").filter(Boolean)
    : [];
  const degree = url.searchParams.get("degree") || "";
  const minExperienceParam = url.searchParams.get("minExperience");
  const minExperience = minExperienceParam ? parseInt(minExperienceParam) : 0;
  const pageParam = url.searchParams.get("page");
  const page = Math.max(1, pageParam ? parseInt(pageParam) : 1);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam) : 25;
  const limit = [10, 25, 100].includes(parsedLimit) ? parsedLimit : 25;

  // Build filter conditions
  const conditions = [];

  // Name or city search (case-insensitive)
  if (search) {
    conditions.push(
      or(
        ilike(advocates.firstName, `%${search}%`),
        ilike(advocates.lastName, `%${search}%`),
        ilike(advocates.city, `%${search}%`)
      )
    );
  }

  // Specialties filter (JSONB array contains check)
  if (specialties.length > 0) {
    conditions.push(
      sql`${advocates.specialties}::jsonb ?| array[${sql.join(
        specialties.map((s) => sql`${s}`),
        sql`, `
      )}]`
    );
  }

  // Degree filter (exact match, case-insensitive)
  if (degree) {
    conditions.push(ilike(advocates.degree, degree));
  }

  // Years of experience filter (>=)
  if (minExperience > 0) {
    conditions.push(gte(advocates.yearsOfExperience, minExperience));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(advocates)
    .where(whereClause);

  // Get paginated results
  const data = await db
    .select()
    .from(advocates)
    .where(whereClause)
    .limit(limit)
    .offset((page - 1) * limit);

  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}
