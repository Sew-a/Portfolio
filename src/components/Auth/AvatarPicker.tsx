import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Avatar from "@/src/components/UI/Avatar";
import { IMAGE_MIME_TYPES, validateImageFile } from "@/src/lib/api/config";

interface AvatarPickerProps {
  /** Used for the initial-letter fallback. */
  name: string;
  /** Currently saved avatar, shown when no new file is picked. */
  currentSrc?: string | null;
  /** Picked file to preview (controlled by the parent). */
  file?: File | null;
  onPick: (file: File) => void;
  /** Shown as a "Remove" button when provided and there is something to remove. */
  onRemove?: () => void;
  disabled?: boolean;
}

/** Avatar preview with "choose image from device" and optional remove. Validates type and size. */
const AvatarPicker: React.FC<AvatarPickerProps> = ({
  name,
  currentSrc,
  file,
  onPick,
  onRemove,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!picked) return;

    const invalid = validateImageFile(picked);
    setError(invalid);
    if (!invalid) onPick(picked);
  };

  const src = previewUrl ?? currentSrc;

  return (
    <div className="avatar-picker">
      <Avatar name={name || "?"} src={src} size="lg" />
      <div className="avatar-picker__actions">
        <button
          type="button"
          className="avatar-picker__btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus size={14} />
          {src ? "Change picture" : "Upload picture"}
        </button>
        {onRemove && src && (
          <button
            type="button"
            className="avatar-picker__btn avatar-picker__btn--danger"
            onClick={() => {
              setError(null);
              onRemove();
            }}
            disabled={disabled}
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
        <span className="avatar-picker__hint">PNG, JPG, WebP, GIF or AVIF · max 10 MB</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_MIME_TYPES.join(",")}
        onChange={handleChange}
        hidden
      />
      {error && (
        <p className="avatar-picker__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default AvatarPicker;
