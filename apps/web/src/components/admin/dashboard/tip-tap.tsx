import "@/styles/tip-tap.css";
import BulletList from "@tiptap/extension-bullet-list";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./menu-bar";

const extensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
  }),
  Heading.configure({
    HTMLAttributes: {
      class: "text-lg font-bold",
      levels: [2],
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc",
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal",
    },
  }),
];

export function TipTap({
  text,
  onChange,
}: {
  text: string;
  onChange: (richText: string) => void;
}) {
  const tiptapEditor = useEditor({
    extensions,
    content: text,
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  return (
    <div className="flex flex-col gap-3">
      <MenuBar editor={tiptapEditor} />
      <EditorContent editor={tiptapEditor} />
    </div>
  );
}
