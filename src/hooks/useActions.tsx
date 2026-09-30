import { useAppStore } from "@/src/store/useAppStore";
import { ACTION_NAMES, ActionType } from "@/src/store/types";
import { useCallback } from "react";

type ActionData = {
  action: ActionType;
  id?: string;
  url?: string;
  event?: React.ChangeEvent<HTMLInputElement>;
};

const useActions = () => {
  const setImageFiles = useAppStore((s) => s.setImageFiles);

  // Delete image action
  const deleteImage = useCallback(
    async (url: string) => {
      try {
        const response = await fetch("/api/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          setImageFiles((prev) => prev.filter((img) => img.url !== url));
        } else {
          console.error("Failed to delete image");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    },
    [setImageFiles],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/images", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const newImage = await response.json();
          setImageFiles((prev) => [...prev, newImage]);
        } else {
          console.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }

      // Reset the input
      event.target.value = "";
    },
    [setImageFiles],
  );

  const mutate = async ({ action, id, url, event }: ActionData) => {
    console.log(`Action: ${action}, ID: ${id}, URL: ${url}`);

    switch (action) {
      case ACTION_NAMES.OPEN:
        // open in popup
        break;
      case ACTION_NAMES.RENAME:
        // Implement rename logic here
        break;
      case ACTION_NAMES.DOWNLOAD:
        // Implement download logic here
        break;
      case ACTION_NAMES.DELETE:
        if (url) await deleteImage(url);
        break;
      case ACTION_NAMES.UPLOAD:
        if (event) await handleFileChange(event);
        break;
      // Add more cases for other actions if needed
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  return { mutate };
};

export default useActions;
