import { Directory, Filesystem } from "@capacitor/filesystem";
import { useCallback } from "react";

export function useFilesystem() {
  const readFile = useCallback(async (path: string): Promise<string> => {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });
    if (typeof result.data === "string") {
      return result.data;
    } else {
      const reader = new FileReader();
      return await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(new Blob([result.data]));
      });
    }
  }, []);

  const writeFile = useCallback(
    async (path: string, data: string): Promise<void> => {
      await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Data,
      });
    },
    []
  );

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });
  }, []);

  return {
    readFile,
    writeFile,
    deleteFile,
  };
}
