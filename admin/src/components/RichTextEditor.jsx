import { forwardRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
};

// Wraps ReactQuill with `.prose` typography so what you see while writing
// matches how the content actually renders on the public site — and exposes
// the underlying Quill instance via ref so PdfInserter can insert an embed
// at the cursor position instead of just appending to the end.
const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange }, ref) {
  return (
    <div className="rich-text-editor bg-white rounded border">
      <ReactQuill ref={ref} theme="snow" modules={MODULES} value={value || ""} onChange={onChange} />
    </div>
  );
});

export default RichTextEditor;
