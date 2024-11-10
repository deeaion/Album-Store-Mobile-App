import { useEffect, useState } from "react";
import { useCamera } from "./useCamera";
import { useFilesystem } from "./useFilesystem";
import { usePreferences } from "./usePreferences";

export interface MyPhoto {
  filepath: string;
  webviewPath?: string;
}

const PHOTOS = "photos";

export function usePhotos() {
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const { getPhoto } = useCamera();
  const { readFile, writeFile, deleteFile } = useFilesystem();
  const { getPreference, setPreference } = usePreferences();

  useEffect(() => {
    loadPhotos();
  }, []);

  return {
    photos,
    takePhoto,
    deletePhoto,
  };

  async function takePhoto(): Promise<MyPhoto | null> {
    try {
      const data = await getPhoto();
      const filepath = `${Date.now()}.jpeg`;
      await writeFile(filepath, data.base64String!);
      const webviewPath = `data:image/jpeg;base64,${data.base64String}`;
      const newPhoto = { filepath, webviewPath };
      setPhotos([newPhoto, ...photos]);

      await setPreference(
        PHOTOS,
        JSON.stringify(
          [newPhoto, ...photos].map((p) => ({ filepath: p.filepath }))
        )
      );

      return newPhoto;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  }

  async function deletePhoto(photo: MyPhoto) {
    const updatedPhotos = photos.filter((p) => p.filepath !== photo.filepath);
    await setPreference(
      PHOTOS,
      JSON.stringify(updatedPhotos.map((p) => ({ filepath: p.filepath })))
    );
    await deleteFile(photo.filepath);
    setPhotos(updatedPhotos);
  }

  async function loadPhotos() {
    const savedPhotoString = await getPreference(PHOTOS);
    const savedPhotos = savedPhotoString ? JSON.parse(savedPhotoString) : [];

    const loadedPhotos = [];
    for (const photo of savedPhotos) {
      const data = await readFile(photo.filepath);
      loadedPhotos.push({
        ...photo,
        webviewPath: `data:image/jpeg;base64,${data}`,
      });
    }

    setPhotos(loadedPhotos);
  }
}
