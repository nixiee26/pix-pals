import React, { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, Target, Quote, FileText, Pin, Trash2, Lock, Sparkles, Move } from 'lucide-react';
import { VisionBoardItem, VisionItemType } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';

interface VisionBoardViewProps {
  items: VisionBoardItem[];
  onSaveItems: (items: VisionBoardItem[]) => void;
}

export const VisionBoardView: React.FC<VisionBoardViewProps> = ({ items, onSaveItems }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<VisionItemType>('goal');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBgColor, setNewBgColor] = useState('#fcf3d9');
  const [newTextColor, setNewTextColor] = useState('#2c221e');
  const [newFontStyle, setNewFontStyle] = useState<'pixel' | 'clean' | 'script'>('pixel');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Dragging state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() && !newImageUrl) return;

    // Position staggered across canvas
    const x = 30 + ((items.length * 35) % 350);
    const y = 30 + ((items.length * 40) % 250);

    const newItem: VisionBoardItem = {
      id: `vis_${Date.now()}`,
      type: newType,
      title: newTitle || undefined,
      content: newContent,
      imageUrl: newImageUrl || undefined,
      deadline: newDeadline || undefined,
      x,
      y,
      width: newType === 'image' ? 280 : 260,
      height: newType === 'image' ? 220 : 160,
      bgColor: newBgColor,
      textColor: newTextColor,
      fontStyle: newFontStyle,
      isPinnedToFocus: items.length === 0, // pin first by default
    };

    onSaveItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setNewDeadline('');
  };

  const handleDeleteItem = (id: string) => {
    onSaveItems(items.filter(i => i.id !== id));
  };

  const handleTogglePin = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isPinnedToFocus: !item.isPinnedToFocus };
      }
      return item;
    });
    onSaveItems(updated);
  };

  // Drag Start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - boardRect.left - item.x,
      y: e.clientY - boardRect.top - item.y,
    };
    setDraggedItemId(id);
  };

  // Drag Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItemId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();

    const newX = Math.max(0, Math.min(boardRect.width - 260, e.clientX - boardRect.left - dragOffset.current.x));
    const newY = Math.max(0, Math.min(boardRect.height - 180, e.clientY - boardRect.top - dragOffset.current.y));

    const updated = items.map(item => {
      if (item.id === draggedItemId) {
        return { ...item, x: Math.round(newX), y: Math.round(newY) };
      }
      return item;
    });
    onSaveItems(updated);
  };

  const handleMouseUp = () => {
    setDraggedItemId(null);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12 select-none">
      {/* 1. Header with Privacy Shield Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <PixelMascot id="star" size={40} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-base text-[#2c221e]">Dream Vision Board</h1>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-[#faeedf] text-[#8c4e23] border border-[#2c221e] px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" /> 100% Private to You
              </span>
            </div>
            <p className="text-xs text-[#847367] font-medium mt-0.5">
              Visualize what you're working toward. Pinned cards appear in your study room.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vision Card</span>
        </button>
      </div>

      {/* 2. Interactive Freeform Canvas */}
      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full min-h-[550px] bg-[#fbf7ee] border-3 border-[#2c221e] rounded-xl shadow-pixel p-6 overflow-hidden bg-[radial-gradient(#ded3c5_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {items.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 mb-3">
              <PixelMascot id="calico_cat" state="idle" size={56} />
            </div>
            <h3 className="font-bold text-sm text-[#2c221e]">
              Your Vision Board is empty
            </h3>
            <p className="text-xs text-[#847367] max-w-sm mt-1 mb-4">
              Add goals, target colleges, dream companies, or inspiring quotes that remind you why you sit down to focus every day.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Card
            </button>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              style={{
                transform: `translate(${item.x}px, ${item.y}px)`,
                backgroundColor: item.bgColor,
                color: item.textColor,
                width: item.width,
                minHeight: item.height,
              }}
              className={`absolute top-0 left-0 border-2 border-[#2c221e] rounded-xl p-3 shadow-pixel-sm transition-shadow ${
                draggedItemId === item.id ? 'z-30 shadow-pixel-lg cursor-grabbing scale-102' : 'z-10'
              }`}
            >
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                <div
                  onMouseDown={e => handleDragStart(e, item.id)}
                  className="cursor-grab p-1 hover:bg-black/5 rounded text-black/40 hover:text-black"
                  title="Drag card to position"
                >
                  <Move className="w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePin(item.id)}
                    className={`p-1 rounded text-xs transition-all ${
                      item.isPinnedToFocus
                        ? 'bg-[#df793b] text-white shadow-xs'
                        : 'text-black/40 hover:text-black'
                    }`}
                    title={item.isPinnedToFocus ? 'Pinned to Focus Room' : 'Pin to Focus Room'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 rounded text-black/40 hover:text-[#c9302c]"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title if present */}
              {item.title && (
                <h4
                  className={`font-bold text-xs mb-1.5 leading-snug ${
                    item.fontStyle === 'pixel' ? 'font-pixel text-[10px]' : ''
                  }`}
                >
                  {item.title}
                </h4>
              )}

              {/* Image if present */}
              {item.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-[#2c221e] mb-2 max-h-32">
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Vision inspiration'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Body Content */}
              {item.content && (
                <p
                  className={`text-xs leading-relaxed font-semibold ${
                    item.type === 'quote' ? 'italic font-bold' : ''
                  }`}
                >
                  {item.type === 'quote' ? `“${item.content}”` : item.content}
                </p>
              )}

              {/* Deadline badge */}
              {item.deadline && (
                <div className="mt-2 text-right">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10">
                    Target: {item.deadline}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Vision Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-md w-full">
            <h3 className="font-pixel text-sm text-[#2c221e] mb-4">
              Add to Vision Board
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { type: 'goal', label: 'Goal', icon: <Target className="w-4 h-4" /> },
                { type: 'quote', label: 'Quote', icon: <Quote className="w-4 h-4" /> },
                { type: 'note', label: 'Note', icon: <FileText className="w-4 h-4" /> },
                { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
              ].map(t => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setNewType(t.type as VisionItemType)}
                  className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    newType === t.type
                      ? 'bg-[#d9ead3] border-[#2c221e] shadow-pixel-sm font-extrabold'
                      : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-3">
              {newType !== 'quote' && (
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Operating Systems"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-sm font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  {newType === 'quote' ? 'Motivational Quote *' : 'Description / Goal Details *'}
                </label>
                <textarea
                  rows={3}
                  required={newType !== 'image'}
                  placeholder={
                    newType === 'quote'
                      ? 'e.g. Action cures fear.'
                      : 'Write clearly what you are striving for...'
                  }
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-semibold"
                />
              </div>

              {newType === 'image' && (
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Upload Picture or Paste URL
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-[#847367] file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-[#2c221e] file:bg-[#faeedf] file:text-xs file:font-bold mb-2 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-medium"
                  />
                </div>
              )}

              {newType === 'goal' && (
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Target Date / Deadline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2026 or Spring Semester"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                  />
                </div>
              )}

              {/* Color & Style Palette */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Card Background
                  </label>
                  <div className="flex gap-1.5">
                    {['#ffffff', '#fcf3d9', '#e5f0e6', '#faeedf', '#e7eef7', '#f2ecfb'].map(
                      c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewBgColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newBgColor === c ? 'border-[#2c221e] scale-110 shadow-xs' : 'border-[#baa494]'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Font Accent
                  </label>
                  <select
                    value={newFontStyle}
                    onChange={e => setNewFontStyle(e.target.value as any)}
                    className="w-full px-2 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                  >
                    <option value="pixel">Retro Pixel</option>
                    <option value="clean">Modern Clean</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0e6dc]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold"
                >
                  Pin to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
