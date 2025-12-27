import { useState, useRef, useEffect, useCallback } from 'react';
import { cosineSimilarity } from '../utils/math';
import type { Route, RouteWithSimilarity } from '../types/types';

export const useRouteSearch = (routes: Route[]) => {
    const [processedRoutes, setProcessedRoutes] = useState<RouteWithSimilarity[]>(() => {
      return routes.map(route => ({
        ...route,
        similarityScore: 0,
        isVisible: true,
        embedding: undefined
      }));
    });
    
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    if (processedRoutes.length === 0 && routes.length > 0) {
      setProcessedRoutes(
        routes.map(route => ({
          ...route,
          similarityScore: 0,
          isVisible: true,
          embedding: undefined
        }))
      );
    }
  }, [routes]);  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (routes.length === 0) {
      return;
    }
  
    const routesForModel = routes.map(route => {
      return {
        id: route.RouteID,
        title: route.Title || '',
        description: route.Description || 'maritime shipping route', // Добавьте fallback
        distance: route.Distance || 0,
        status: route.Status || '',
        imageUrl: route.ImageURL || ''
      };
    });
  

    workerRef.current = new Worker(new URL('../workers/search.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;

      switch (type) {
        case 'progress':
          if (data.status === 'progress') {
            setSearchProgress(data.progress);
          } else if (data.status === 'ready') {
            setIsModelReady(true);
          }
          break;
        
        case 'text_embeddings_ready':
          setProcessedRoutes(prev => prev.map(route => {
            const embedding = data[route.RouteID];
            return embedding ? { ...route, embedding } : route;
          }));
          setIsModelReady(true);
          break;

        case 'image_embedding_ready':
          setImageEmbedding(data);
          setIsProcessingImage(false);
          performSearch(data);
          break;

        case 'error':
          console.error('Worker error:', data);
          setIsProcessingImage(false);
          setIsLoading(false);
          break;
      }
    };

  workerRef.current.postMessage({ 
    type: 'init', 
    data: routesForModel 
  });

  return () => {
    workerRef.current?.terminate();
  };
}, [routes]); 

const performSearch = useCallback((embedding: number[]) => {
  setIsLoading(true);
  
  setTimeout(() => {
    
    setProcessedRoutes(prev => {
      
      const processed = prev.map(route => {
        if (!route.embedding) {
          return {
            ...route,
            similarityScore: 0,
            isVisible: true 
          };
        }
        
        const similarity = cosineSimilarity(embedding, route.embedding);
        
        return {
          ...route,
          similarityScore: similarity,
          isVisible: true 
        };
      });
      
      const sorted = processed.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
      
      setIsLoading(false);
      return sorted;
    });
  }, 100);
}, []);

const uploadImage = useCallback((file: File) => {
    if (!isModelReady || !workerRef.current) return;
    
    setUploadedImage(file);
    setIsProcessingImage(true);
    workerRef.current.postMessage({ type: 'image', data: file });
    
    const searchTimeout = setTimeout(() => {
      if (imageEmbedding) {
        performSearch(imageEmbedding);
      }
    }, 1000);
    
    return () => clearTimeout(searchTimeout);
  }, [isModelReady, imageEmbedding, performSearch]);

  const startSearch = useCallback(() => {
    if (!uploadedImage || !isModelReady || !workerRef.current) return;
    
    if (imageEmbedding) {
      performSearch(imageEmbedding);
    } else {
      setIsProcessingImage(true);
      workerRef.current.postMessage({ type: 'image', data: uploadedImage });
    }
  }, [uploadedImage, isModelReady, imageEmbedding, performSearch]);

  const resetSearch = useCallback(() => {
    setUploadedImage(null);
    setImageEmbedding(null);
    setIsProcessingImage(false);
    setIsLoading(false);
    setProcessedRoutes(prev => 
      prev.map(route => ({
        ...route,
        similarityScore: 0,
        isVisible: true
      })).sort((a, b) => a.RouteID - b.RouteID)
    );
  }, []);

  return {
    processedRoutes,
    uploadedImage,
    isModelReady,
    isLoading,
    isProcessingImage,
    searchProgress,
    uploadImage,
    startSearch,
    resetSearch,
    hasActiveSearch: !!uploadedImage
  };
};