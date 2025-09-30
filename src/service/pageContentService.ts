import axiosInstance from './api';

export interface PageContent {
  id?: string;
  title: string;
  titleAr?: string;
  slug: string;
  content: string;
  contentAr?: string;
  metaDescription: string;
  metaDescriptionAr?: string;
  lastUpdated?: string;
}

// Fetch all page content items
export const fetchPageContents = async (): Promise<PageContent[]> => {
  try {
    const response = await axiosInstance.get('1.0/page-content');
    return response.data;
  } catch (error) {
    console.error('Error fetching page contents:', error);
    throw error;
  }
};

// Fetch a single page content by key (id or slug)
export const fetchPageContentBySlug = async (key: string): Promise<PageContent> => {
  try {
    const response = await axiosInstance.get(`1.0/page-content/${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page content with key ${key}:`, error);
    throw error;
  }
};

// Create or update page content
export const savePageContent = async (pageContent: PageContent): Promise<PageContent> => {
  try {
    // If the content has an ID, it's an update; otherwise, it's a new content
    const method = pageContent.id ? 'put' : 'post';
    const endpoint = pageContent.slug 
      ? `1.0/page-content/${pageContent.slug}` 
      : '1.0/page-content';
    
    const response = await axiosInstance[method](endpoint, pageContent);
    return response.data;
  } catch (error) {
    console.error('Error saving page content:', error);
    throw error;
  }
};
