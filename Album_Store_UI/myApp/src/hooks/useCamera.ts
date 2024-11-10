import { useCallback } from "react";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";

export function useCamera() {
  const getPhoto = useCallback(async (): Promise<Photo> => {
    return await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100,
    });
  }, []);

  return {
    getPhoto,
  };
}
