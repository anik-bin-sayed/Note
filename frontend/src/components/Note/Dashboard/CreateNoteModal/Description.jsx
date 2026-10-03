import ToolbarButton from "./ToolbarButton";

import {
  FiBookOpen,
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiCode,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiUnderline,
} from "react-icons/fi";
import ToolbarDivider from "./ToolbarDivider";
import { EditorContent } from "@tiptap/react";

const Description = ({
  characterCount,
  editor,
  handleAddLink,
  handleTextColor,
  handleHighlight,
}) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="entry-text"
          className="flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <FiBookOpen className="text-slate-400" />
          Description
        </label>

        <span className="text-xs text-slate-400">
          {characterCount} characters
        </span>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-slate-900 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-900/5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2">
          {/* Bold */}
          <ToolbarButton
            title="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>

          {/* Italic */}
          <ToolbarButton
            title="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <FiItalic />
          </ToolbarButton>

          {/* Underline */}
          <ToolbarButton
            title="Underline"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <FiUnderline />
          </ToolbarButton>

          {/* Strike */}
          <ToolbarButton
            title="Strike"
            active={editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <FiMinus />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Heading 1 */}
          <ToolbarButton
            title="Heading 1"
            active={editor?.isActive("heading", { level: 1 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <span className="font-bold">H1</span>
          </ToolbarButton>

          {/* Heading 2 */}
          <ToolbarButton
            title="Heading 2"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <span className="font-bold">H2</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Paragraph alignment */}
          <ToolbarButton
            title="Align Left"
            active={
              editor?.isActive("paragraph", { textAlign: "left" }) ||
              editor?.isActive("heading", { textAlign: "left" })
            }
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          >
            <FiAlignLeft />
          </ToolbarButton>

          <ToolbarButton
            title="Align Center"
            active={
              editor?.isActive("paragraph", { textAlign: "center" }) ||
              editor?.isActive("heading", { textAlign: "center" })
            }
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          >
            <FiAlignCenter />
          </ToolbarButton>

          <ToolbarButton
            title="Align Right"
            active={
              editor?.isActive("paragraph", { textAlign: "right" }) ||
              editor?.isActive("heading", { textAlign: "right" })
            }
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          >
            <FiAlignRight />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Bullet list */}
          <ToolbarButton
            title="Bullet List"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <FiList />
          </ToolbarButton>

          {/* Ordered list */}
          <ToolbarButton
            title="Numbered List"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <span className="text-xs font-bold">1.</span>
          </ToolbarButton>

          {/* Blockquote */}
          <ToolbarButton
            title="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <span className="text-base font-bold">"</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Inline code */}
          <ToolbarButton
            title="Inline Code"
            active={editor?.isActive("code")}
            onClick={() => editor?.chain().focus().toggleCode().run()}
          >
            <FiCode />
          </ToolbarButton>

          {/* Code block */}
          <ToolbarButton
            title="Code Block"
            active={editor?.isActive("codeBlock")}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <span className="text-xs font-bold">{"</>"}</span>
          </ToolbarButton>

          {/* Link */}
          <ToolbarButton
            title="Add Link"
            active={editor?.isActive("link")}
            onClick={handleAddLink}
          >
            <FiLink />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Colors */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              title="Black"
              onClick={() => handleTextColor("#0f172a")}
            >
              <span className="h-3 w-3 rounded-full bg-slate-900" />
            </ToolbarButton>

            <ToolbarButton
              title="Red"
              onClick={() => handleTextColor("#ef4444")}
            >
              <span className="h-3 w-3 rounded-full bg-red-500" />
            </ToolbarButton>

            <ToolbarButton
              title="Blue"
              onClick={() => handleTextColor("#2563eb")}
            >
              <span className="h-3 w-3 rounded-full bg-blue-600" />
            </ToolbarButton>

            <ToolbarButton
              title="Green"
              onClick={() => handleTextColor("#16a34a")}
            >
              <span className="h-3 w-3 rounded-full bg-green-600" />
            </ToolbarButton>

            <ToolbarButton
              title="Purple"
              onClick={() => handleTextColor("#9333ea")}
            >
              <span className="h-3 w-3 rounded-full bg-purple-600" />
            </ToolbarButton>
          </div>

          {/* Highlight */}
          <ToolbarButton
            title="Yellow Highlight"
            active={editor?.isActive("highlight")}
            onClick={() => handleHighlight("#fef08a")}
          >
            <span className="rounded bg-yellow-200 px-1 text-xs font-bold">
              A
            </span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo */}
          <ToolbarButton
            title="Undo"
            disabled={!editor?.can().undo()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <FiRotateCcw />
          </ToolbarButton>

          {/* Redo */}
          <ToolbarButton
            title="Redo"
            disabled={!editor?.can().redo()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <FiRotateCw />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Description;
