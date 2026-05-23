import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { useApp } from '../lib/AppContext';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';

export function Album() {
  const { state, updateState } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const photos = state?.photos || [];

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files as FileList).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto = {
            id: generateId(),
            dataUrl: event.target.result as string,
            createdAt: Date.now(),
          };
          updateState({ 
            photos: [newPhoto, ...(state?.photos || [])] 
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if(confirm("确定要删除这张照片吗？")) {
      updateState({
        photos: photos.filter(p => p.id !== id)
      });
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <header className="pt-4 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2"><span>📷</span> 我们的瞬间</h1>
          <p className="text-sm text-gray-400 mt-1">记录每个闪光瞬间 ({photos.length})</p>
        </div>
        
        <label className="bg-primary-500 text-white p-3 rounded-full cute-shadow cursor-pointer hover:bg-primary-600 transition-colors active:scale-95">
          <input 
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <Plus strokeWidth={2.5} />
        </label>
      </header>

      {photos.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <ImageIcon className="w-16 h-16 mx-auto text-primary-300 mb-4" />
          <p className="text-gray-500 font-handwriting">还没有上传照片哦，快点击加号上传吧~</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-8">
          {photos.map((photo, index) => (
            <motion.div
              layoutId={`photo-${photo.id}`}
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              className={`relative bg-white p-2 pb-8 shadow-md border border-gray-100 cursor-pointer group ${index % 2 === 0 ? 'polaroid' : 'polaroid-alt'}`}
            >
              <div className="aspect-square bg-gray-200 rounded-sm overflow-hidden border border-gray-100">
                <img 
                  src={photo.dataUrl} 
                  alt="Memory" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="absolute bottom-2 left-0 right-0 text-[10px] text-center text-gray-400 font-serif">Memory</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox / Full view modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm"
          >
            <div className="flex justify-between p-4 pb-safe justify-end">
               <button 
                  onClick={(e) => deletePhoto(selectedPhoto, e)} 
                  className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full"
                >
                  删除
                </button>
              <button 
                onClick={() => setSelectedPhoto(null)} 
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="关闭"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.img 
                layoutId={`photo-${selectedPhoto}`}
                src={photos.find(p => p.id === selectedPhoto)?.dataUrl}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
