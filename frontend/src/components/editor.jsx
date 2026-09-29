import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

const editor = useEditor({
  extensions: [
    StarterKit,
    TextStyle,
    Color,
    Highlight,
    Link.configure({
      openOnClick: false,
    }),
  ],
  content: "",
});
