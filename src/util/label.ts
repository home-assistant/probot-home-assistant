import { Context } from "probot";

export const doesLabelExist = async (
  context: Context,
  label: string,
  repo?: string
): Promise<boolean> => {
  const exist = await context.github.issues.getLabel(
    repo ? context.repo({ repo, name: label }) : context.repo({ name: label })
  );

  return exist.status === 200 && exist.data.name === label;
};
