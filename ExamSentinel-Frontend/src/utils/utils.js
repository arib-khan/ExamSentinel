export const convertUsedTimeToSeconds = (usedTimeFloat) => {
  const mins = Math.floor(usedTimeFloat); // e.g., 6
  const secs = Math.round((usedTimeFloat - mins) * 100); // e.g., 41
  return mins * 60 + secs; // e.g., 401
};
