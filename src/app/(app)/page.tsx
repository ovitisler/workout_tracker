import { redirect } from "next/navigation";

// The app opens on Routines. Old `/?exercise=<id>` links go to that exercise.
export default async function Home({ searchParams }: PageProps<"/">) {
  const { exercise } = await searchParams;
  redirect(typeof exercise === "string" ? `/log/${exercise}` : "/routines");
}
