import { useState } from "react";

interface CreateGroupFormProps {
  onCreate: (name?: string) => void;
  isPending: boolean;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onCreate, isPending }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || undefined);
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <h3>Create a group</h3>
      <div className="chat-form__row">
        <input
          id="group-name"
          type="text"
          name="group-name"
          placeholder="Group name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="chat-btn chat-btn--primary" disabled={isPending}>
          Create
        </button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
