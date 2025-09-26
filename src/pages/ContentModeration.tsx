import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { contentModerationData, ContentItem, saveContentItem } from '../mock/contentModerationData';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/rtl.css';

const ContentModeration: React.FC = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // Load mock data
    setContentItems(contentModerationData);
  }, []);

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
    setEditorContent(language === 'en' ? item.content : item.contentAr);
    setIsEditing(false);
  };

  const handleEditContent = () => {
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!selectedItem) return;
    
    setIsSaving(true);
    try {
      const updatedItem: ContentItem = {
        ...selectedItem,
        // Update only the content for the current language
        ...(language === 'en' 
          ? { content: editorContent } 
          : { contentAr: editorContent })
      };
      
      const savedItem = await saveContentItem(updatedItem);
      
      // Update the items list with the saved item
      setContentItems(prevItems => 
        prevItems.map(item => 
          item.id === savedItem.id ? savedItem : item
        )
      );
      
      setSelectedItem(savedItem);
      setIsEditing(false);
      const itemTitle = language === 'en' ? savedItem.title : savedItem.titleAr;
      toast.success(`${itemTitle} ${t('success.saved')}`);
    } catch (error) {
      toast.error(t('error.save'));
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedItem) {
      setEditorContent(language === 'en' ? selectedItem.content : selectedItem.contentAr);
    }
    setIsEditing(false);
  };
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    
    // Update editor content if an item is selected
    if (selectedItem) {
      setEditorContent(newLanguage === 'en' ? selectedItem.content : selectedItem.contentAr);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className={`p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('content.moderation')}</h1>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">{t('content.items')}</h2>
          <ul className="space-y-2">
            {contentItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => handleSelectItem(item)}
                  className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2 rounded-md transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-900 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {language === 'en' ? item.title : item.titleAr}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Content Editor */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
          {selectedItem ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{language === 'en' ? selectedItem.title : selectedItem.titleAr}</h2>
                <div className={`${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveContent}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                      >
                        {isSaving ? t('button.saving') : t('button.save')}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                      >
                        {t('button.cancel')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditContent}
                      className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                    >
                      {t('button.edit')}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                {t('last.updated')}: {formatDate(selectedItem.lastUpdated)}
              </div>
              
              {isEditing ? (
                <div className="border rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={setEditorContent}
                    modules={modules}
                    className="h-96"
                  />
                </div>
              ) : (
                <div 
                  className="prose max-w-none border rounded-md p-4 h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: language === 'en' ? selectedItem.content : selectedItem.contentAr }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              {t('content.select')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;
