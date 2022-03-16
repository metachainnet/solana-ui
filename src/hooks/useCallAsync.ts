export function useCallAsync() {
  return async function callAsync(
    promise: Promise,
    {
      progressMessage = "Submitting...",
      successMessage = "Success",
      onSuccess,
      onError,
    } = {}
  ) {
    try {
      let result = await promise;

      if (successMessage) {
      }
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e) {
      console.warn(e);
      if (onError) {
        onError(e);
      }
    }
  };
}
