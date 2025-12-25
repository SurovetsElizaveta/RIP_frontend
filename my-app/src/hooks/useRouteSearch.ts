import { useState, useRef, useEffect, useCallback } from 'react';
import { cosineSimilarity } from '../utils/math';
import type { Route, RouteWithSimilarity } from '../types/types';

export const useRouteSearch = (routes: Route[]) => {
    // ИСПРАВЬТЕ начальное состояние - оно должно зависеть от routes
    const [processedRoutes, setProcessedRoutes] = useState<RouteWithSimilarity[]>(() => {
      console.log('🔄 Creating initial processedRoutes from', routes.length, 'routes');
      return routes.map(route => ({
        ...route,
        similarityScore: 0,
        isVisible: true,
        embedding: undefined
      }));
    });
    
    // ... остальной код
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    console.log('🔄 Routes changed, syncing processedRoutes:', {
      oldCount: processedRoutes.length,
      newCount: routes.length,
      routesChanged: processedRoutes.length !== routes.length
    });
    
    // Если routes изменились, обновите processedRoutes
    if (processedRoutes.length === 0 && routes.length > 0) {
      console.log('🔄 Initializing processedRoutes from routes');
      setProcessedRoutes(
        routes.map(route => ({
          ...route,
          similarityScore: 0,
          isVisible: true,
          embedding: undefined
        }))
      );
    }
  }, [routes]); // Зависимость от routes
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    console.log('🔄 useRouteSearch useEffect - initializing worker');
    console.log('📊 Routes count:', routes.length);
    
    if (routes.length === 0) {
      console.warn('⚠️ No routes to initialize worker');
      return;
    }
  
    // Преобразуем данные маршрутов для модели
    const routesForModel = routes.map(route => {
      console.log(`📝 Preparing route ${route.RouteID}:`, route.Title);
      return {
        id: route.RouteID,
        title: route.Title || '',
        description: route.Description || 'maritime shipping route', // Добавьте fallback
        distance: route.Distance || 0,
        status: route.Status || '',
        imageUrl: route.ImageURL || ''
      };
    });
  
    console.log('✅ Routes for model prepared:', routesForModel.length);

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
          // Автоматически запускаем поиск после получения эмбеддинга изображения
          performSearch(data);
          break;

        case 'error':
          console.error('Worker error:', data);
          setIsProcessingImage(false);
          setIsLoading(false);
          break;
      }
    };

    console.log('📤 Sending routes to worker:', routesForModel.length);
  workerRef.current.postMessage({ 
    type: 'init', 
    data: routesForModel 
  });

  return () => {
    console.log('🧹 Cleaning up worker');
    workerRef.current?.terminate();
  };
}, [routes]); // Важно: зависимость от routes

  // В функции performSearch добавьте логирование:
const performSearch = useCallback((embedding: number[]) => {
    console.log('🔍 Starting search with embedding:', {
        length: embedding.length,
        first5: embedding.slice(0, 5),
        hasEmbedding: !!embedding
    });
    
    setIsLoading(true);
    
    setTimeout(() => {
        // ВРЕМЕННО снизьте порог до очень низкого значения!
        const threshold = 0.01; // Было 0.05
        
        console.log(`🎯 Using threshold: ${threshold}`);

        setProcessedRoutes(prev => {
            console.log(`📊 Processing ${prev.length} routes`);
            
            let processedCount = 0;
            let embeddingCount = 0;
            
            const processed = prev.map(route => {
                processedCount++;
                
                if (!route.embedding) {
                    console.log(`❌ Route ${route.RouteID}: no embedding`);
                    return {
                        ...route,
                        similarityScore: 0,
                        isVisible: false
                    };
                }
                
                embeddingCount++;
                const similarity = cosineSimilarity(embedding, route.embedding);
                
                // Логируем все сходства для анализа
                if (processedCount <= 5) { // Только первые 5 для избежания спама
                    console.log(`📈 Route ${route.RouteID}: similarity = ${similarity.toFixed(4)}`);
                }
                
                const isVisible = similarity > threshold;
                
                if (isVisible) {
                    console.log(`🎯 Route ${route.RouteID} is VISIBLE with score: ${similarity.toFixed(4)}`);
                }
                
                return {
                    ...route,
                    similarityScore: similarity,
                    isVisible: isVisible
                };
            });

            console.log(`📈 Summary: ${embeddingCount}/${processedCount} routes had embeddings`);
            
            const sorted = processed.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
            
            // Логируем топ-5 результатов
            const top5 = sorted.slice(0, 5);
            console.log('🏆 Top 5 results:', top5.map(r => ({
                id: r.RouteID,
                score: r.similarityScore?.toFixed(4),
                visible: r.isVisible,
                hasEmbedding: !!r.embedding
            })));
            
            const visibleRoutes = sorted.filter(r => r.isVisible);
            console.log(`👁️ Visible routes: ${visibleRoutes.length}`);
            
            setIsLoading(false);
            return sorted;
        });
    }, 100);
}, []);

  // В функции uploadImage добавьте автоматический старт поиска
const uploadImage = useCallback((file: File) => {
    if (!isModelReady || !workerRef.current) return;
    
    setUploadedImage(file);
    setIsProcessingImage(true);
    workerRef.current.postMessage({ type: 'image', data: file });
    
    // Автоматически запускаем поиск через 1 секунду после получения эмбеддинга
    const searchTimeout = setTimeout(() => {
      if (imageEmbedding) {
        performSearch(imageEmbedding);
      }
    }, 1000);
    
    return () => clearTimeout(searchTimeout);
  }, [isModelReady, imageEmbedding, performSearch]);

  const startSearch = useCallback(() => {
    if (!uploadedImage || !isModelReady || !workerRef.current) return;
    
    // Если уже есть эмбеддинг изображения, сразу выполняем поиск
    if (imageEmbedding) {
      performSearch(imageEmbedding);
    } else {
      // Иначе заново обрабатываем изображение
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