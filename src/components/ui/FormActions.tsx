"use client";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isNew: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
  hideDiscard?: boolean;
}

export function FormActions({
  isNew,
  hasChanges,
  onSave,
  onDiscard,
  onDelete,
  hideDiscard = false,
}: FormActionsProps) {
  return (
    <div className="flex gap-4 justify-end">
      {isNew ? (
        <Button
          type="button"
          onClick={onSave}
          disabled={!hasChanges}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Save Form
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSave}
          disabled={!hasChanges}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Update Form
        </Button>
      )}
      
      {!hideDiscard && !isNew && (
        <Button
          type="button"
          variant="outline"
          onClick={onDiscard}
          disabled={!hasChanges}
          className="cursor-pointer"
        >
          Discard Changes
        </Button>
      )}
      
      {!isNew && onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          className="cursor-pointer"
        >
          Delete Form
        </Button>
      )}
    </div>
  );
}
