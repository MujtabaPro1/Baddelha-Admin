import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/rtl.css';
import { PageContent, fetchPageContents, fetchPageContentBySlug, savePageContent } from '../service/pageContentService';
import { PlusCircle, Loader2 } from 'lucide-react';

const ContentModeration: React.FC = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [contentItems, setContentItems] = useState<PageContent[]>([]);
  const [selectedItem, setSelectedItem] = useState<PageContent | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newContentTitle, setNewContentTitle] = useState<string>('');
  const [newContentSlug, setNewContentSlug] = useState<string>('');
  const [newContentMetaDescription, setNewContentMetaDescription] = useState<string>('');

  useEffect(() => {
    const loadPageContents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPageContents();
        setContentItems(data);
      } catch (err) {
        console.error('Failed to fetch page contents:', err);
        setError(t('error.loading'));
        toast.error(t('error.loading'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPageContents();
  }, [t]);

  const handleSelectItem = async (item: PageContent) => {
    try {
      // Clear previous errors
      setContentError(null);
      
      // Set loading state
      setIsLoadingContent(true);
      
      // Get the key (id or slug) to fetch the content
      const contentKey = item.id || item.slug;
      
      // Fetch the full content from the API
      const fullContent = await fetchPageContentBySlug(contentKey);
      
      // Update the selected item with the full content
      setSelectedItem(fullContent);
      
      // Set the editor content based on the language
      setEditorContent(language === 'en' ? fullContent.content : (fullContent.contentAr || ''));
      
      // Exit editing mode
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to fetch content details:', err);
      setContentError('Failed to load content details');
      toast.error('Failed to load content details');
      
      // Still set the selected item with the basic info we have
      setSelectedItem(item);
      setEditorContent(language === 'en' ? item.content : (item.contentAr || ''));
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleEditContent = () => {
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!selectedItem && !isCreatingNew) return;
    
    setIsSaving(true);
    try {
      let savedItem: PageContent;
      
      if (isCreatingNew) {
        // Create new content
        const newItem: PageContent = {
          title: newContentTitle,
          slug: newContentSlug,
          content: editorContent,
          metaDescription: newContentMetaDescription,
          // Add Arabic versions if in Arabic mode
          ...(language === 'ar' && {
            titleAr: newContentTitle,
            contentAr: editorContent,
            metaDescriptionAr: newContentMetaDescription
          })
        };
        
        savedItem = await savePageContent(newItem);
        
        // Add the new item to the list
        setContentItems(prevItems => [...prevItems, savedItem]);
        setIsCreatingNew(false);
      } else {
        // Update existing content
        const updatedItem: PageContent = {
          ...selectedItem!,
          // Update only the content for the current language
          ...(language === 'en' 
            ? { content: editorContent } 
            : { contentAr: editorContent })
        };
        
        savedItem = await savePageContent(updatedItem);
        
        // Update the items list with the saved item
        setContentItems(prevItems => 
          prevItems.map(item => 
            (item.id === savedItem.id || item.slug === savedItem.slug) ? savedItem : item
          )
        );
      }
      
      setSelectedItem(savedItem);
      setIsEditing(false);
      const itemTitle = language === 'en' ? savedItem.title : (savedItem.titleAr || savedItem.title);
      toast.success(`${itemTitle} ${t('success.saved')}`);
    } catch (error) {
      toast.error(t('error.save'));
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setNewContentTitle('');
      setNewContentSlug('');
      setNewContentMetaDescription('');
      setEditorContent('');
    } else if (selectedItem) {
      setEditorContent(language === 'en' ? selectedItem.content : (selectedItem.contentAr || ''));
    }
    setIsEditing(false);
  };
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    
    // Update editor content if an item is selected
    if (selectedItem) {
      setEditorContent(newLanguage === 'en' ? selectedItem.content : (selectedItem.contentAr || ''));
    }
  };
  
  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsCreatingNew(true);
    setIsEditing(true);
    setEditorContent('');
    setNewContentTitle('');
    setNewContentSlug('');
    setNewContentMetaDescription('');
  };
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setNewContentTitle(title);
    // Auto-generate slug if user hasn't manually edited it
    if (!newContentSlug || newContentSlug === generateSlug(newContentTitle)) {
      setNewContentSlug(generateSlug(title));
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
        <div className="flex space-x-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <PlusCircle className="mr-2" size={18} />
            { 'Add New'}
          </button>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">{t('content.items')}</h2>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : contentItems.length === 0 ? (
            <div className="text-gray-500 p-4">{'Empty'}</div>
          ) : (
            <ul className="space-y-2">
              {contentItems.map(item => (
                <li key={item.id || item.slug}>
                  <button
                    onClick={() => handleSelectItem(item)}
                    className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2 rounded-md transition-colors ${
                      selectedItem?.id === item.id || selectedItem?.slug === item.slug
                        ? 'bg-blue-900 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {language === 'en' ? item.title : (item.titleAr || item.title)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Content Editor */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
          {isCreatingNew ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{'New Content'}</h2>
                <div className={`${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <button
                    onClick={handleSaveContent}
                    disabled={isSaving || !newContentTitle || !newContentSlug}
                    className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    {'Cancel'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('content.title') || 'Title'}</label>
                  <input
                    type="text"
                    value={newContentTitle}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('content.titlePlaceholder') || 'Enter title'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('content.slug') || 'Slug'}</label>
                  <input
                    type="text"
                    value={newContentSlug}
                    onChange={(e) => setNewContentSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={'Enter slug'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('content.metaDescription') || 'Meta Description'}</label>
                  <input
                    type="text"
                    value={newContentMetaDescription}
                    onChange={(e) => setNewContentMetaDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={'Enter meta description'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{'Content'}</label>
                  <div className="border rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={editorContent}
                      onChange={setEditorContent}
                      modules={modules}
                      className="h-96"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : selectedItem ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{language === 'en' ? selectedItem.title : (selectedItem.titleAr || selectedItem.title)}</h2>
                <div className={`${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveContent}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                      >
                        {'Cancel'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditContent}
                      className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                    >
                      {'Edit'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                {selectedItem.lastUpdated ? `Last updated: ${formatDate(selectedItem.lastUpdated)}` : ''}
                {selectedItem.slug && <div className="mt-1">Slug: {selectedItem.slug}</div>}
                {selectedItem.id && <div className="mt-1">ID: {selectedItem.id}</div>}
              </div>
              
              {contentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {contentError}
                </div>
              )}
              
              {isLoadingContent && !isEditing ? (
                <div className="flex items-center justify-center h-96 border rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                  <span className="ml-2">Loading content...</span>
                </div>
              ) : isEditing ? (
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
                  dangerouslySetInnerHTML={{ __html: language === 'en' ? selectedItem.content : (selectedItem.contentAr || '') }}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <p className="mb-4">{'Select a content'}</p>
              <button
                onClick={handleCreateNew}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PlusCircle className="mr-2" size={18} />
                {'Add New'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;
