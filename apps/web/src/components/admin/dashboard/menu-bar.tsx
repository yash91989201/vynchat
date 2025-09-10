// TYPES
import type { Editor } from "@tiptap/react";
// ICONS
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";
// CUSTOM COMPONENTS
import { Toggle } from "@/components/ui/toggle";

type EditorProps = {
  editor: Editor | null;
};

export function MenuBar({ editor }: EditorProps) {
  if (!editor) {
    return null;
  }

  return (
    <section className="flex justify-between rounded-md border bg-transparent p-1">
      <div className="space-x-2">
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          pressed={editor.isActive("heading")}
          size="sm"
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </Toggle>
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleBold().run();
          }}
          pressed={editor.isActive("bold")}
          size="sm"
          title="Bold"
        >
          <Bold className="size-4" />
        </Toggle>
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleItalic().run();
          }}
          pressed={editor.isActive("italic")}
          size="sm"
          title="Italics"
        >
          <Italic className="size-4" />
        </Toggle>
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
          pressed={editor.isActive("bulletList")}
          size="sm"
          title="Bullet List"
        >
          <List className="size-4" />
        </Toggle>
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleOrderedList().run();
          }}
          pressed={editor.isActive("orderedList")}
          size="sm"
          title="Number List"
        >
          <ListOrdered className="size-4" />
        </Toggle>
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().toggleCodeBlock().run();
          }}
          pressed={editor.isActive("codeBlock")}
          size="sm"
          title="Code Block"
        >
          <Code className="size-4" />
        </Toggle>
      </div>
      <div className="space-x-2">
        <Toggle
          onPressedChange={() => {
            editor.chain().focus().undo().run();
          }}
          pressed={true}
          size="sm"
          title="Undo"
        >
          <Undo2 className="size-4" />
        </Toggle>

        <Toggle
          onPressedChange={() => {
            editor.chain().focus().redo().run();
          }}
          pressed={true}
          size="sm"
          title="Redo"
        >
          <Redo2 className="size-4" />
        </Toggle>
      </div>
    </section>
  );
}
