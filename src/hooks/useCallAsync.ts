import { useToast } from "@chakra-ui/react";

export type asyncParam = {
  progressMessage: string;
  successMessage: string;
  onSuccess?: undefined | Function;
  onError?: undefined | Function;
};

export function useCallAsync() {
  const toast = useToast();
  return async function callAsync(
    promise: Promise<any>,
    {
      progressMessage = "Submitting...",
      successMessage = "Success",
      onSuccess,
      onError,
    }: asyncParam
  ) {
    let id = toast({
      description: progressMessage,
    });

    try {
      let result = await promise;
      toast.close(id!);
      if (successMessage) {
        toast({
          description: successMessage,
        });
      }
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e: any) {
      console.warn(e);
      toast.close(id!);
      toast({
        description: e.message,
      });
      if (onError) {
        onError(e);
      }
    }
  };
}
