import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

const useTiptapEditor = ({ setText, setError }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],

    content: "",

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      setText(editor.getHTML());
      setError("");
    },

    editorProps: {
      attributes: {
        class:
          "min-h-[230px] w-full px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none",
      },
    },
  });

  return editor;
};

export default useTiptapEditor;
