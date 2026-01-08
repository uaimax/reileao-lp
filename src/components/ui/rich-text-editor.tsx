import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button } from './button';
import { Label } from './label';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  label,
  placeholder = "Digite o conteúdo...",
  disabled = false,
  className = ""
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neon-cyan hover:text-neon-purple transition-colors cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-4',
      },
    },
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const undo = () => {
    editor?.chain().focus().undo().run();
  };

  const redo = () => {
    editor?.chain().focus().redo().run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-soft-white">{label}</Label>
      )}
      
      <div className="bg-dark-bg/50 border border-neon-purple/30 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-neon-purple/20 bg-dark-bg/30">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleBold}
            disabled={disabled}
            className={`h-8 w-8 p-0 hover:bg-neon-purple/20 ${
              editor.isActive('bold') ? 'bg-neon-purple/30 text-neon-purple' : 'text-soft-white'
            }`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleItalic}
            disabled={disabled}
            className={`h-8 w-8 p-0 hover:bg-neon-purple/20 ${
              editor.isActive('italic') ? 'bg-neon-purple/30 text-neon-purple' : 'text-soft-white'
            }`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-neon-purple/20 mx-1" />
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleBulletList}
            disabled={disabled}
            className={`h-8 w-8 p-0 hover:bg-neon-purple/20 ${
              editor.isActive('bulletList') ? 'bg-neon-purple/30 text-neon-purple' : 'text-soft-white'
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleOrderedList}
            disabled={disabled}
            className={`h-8 w-8 p-0 hover:bg-neon-purple/20 ${
              editor.isActive('orderedList') ? 'bg-neon-purple/30 text-neon-purple' : 'text-soft-white'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={setLink}
            disabled={disabled}
            className={`h-8 w-8 p-0 hover:bg-neon-purple/20 ${
              editor.isActive('link') ? 'bg-neon-purple/30 text-neon-purple' : 'text-soft-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-neon-purple/20 mx-1" />
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-neon-purple/20 text-soft-white"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-neon-purple/20 text-soft-white"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Editor Content */}
        <div className="text-soft-white">
          <EditorContent 
            editor={editor} 
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
};