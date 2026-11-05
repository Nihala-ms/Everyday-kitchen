import EditRecipeClient from "./EditRecipeClient";

export const instant = false;

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditRecipeClient id={id} />;
}
