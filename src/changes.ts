// Simple implementation for MVP
let changes: Array<() => Promise<unknown>> = [];

export const scheduleChange = (doChange: () => Promise<unknown>) => {
  changes.push(doChange);
};

export const applyChanges = async () => {
  if (changes.length == 0) {
    return;
  }
  const toProcess = changes;
  changes = [];
  console.log(`Applying ${toProcess.length} changes`);
  await Promise.all(toProcess);
};
