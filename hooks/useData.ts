import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook de données avec synchronisation temps réel (Realtime).
 * Respecte le principe : Offline First (lecture cache si possible) + Live Updates.
 * 
 * @param tableName Nom de la table Supabase
 * @param initialData Données par défaut (Skeleton)
 * @param orderBy Champ de tri
 * @param communityId Filtrage par communauté (Security)
 * @param enableRealtime Activer les websockets pour ce hook (défaut: true)
 */
export function useData<T extends { id: string }>(
  tableName: string, 
  initialData: T[] = [],
  orderBy?: string, 
  communityId?: string,
  enableRealtime: boolean = true
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Utilisation d'une ref pour éviter les re-renders inutiles lors des callbacks realtime
  const dataRef = useRef<T[]>(initialData);

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    async function fetchData() {
      // Si hors-ligne, on ne tente pas le fetch mais on ne bloque pas le render.
      // (Dans une vraie app PWA, ici on lirait le Cache/IndexedDB)
      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase.from(tableName).select('*');
        
        if (communityId) {
          query = query.eq('community_id', communityId);
        }

        if (orderBy) {
          query = query.order(orderBy, { ascending: false });
        }

        const { data: dbData, error: dbError } = await query;

        if (dbError) throw dbError;

        if (isMounted) {
          const typedData = (dbData as unknown) as T[];
          setData(typedData);
          dataRef.current = typedData; // Sync ref
        }
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err.message || JSON.stringify(err);
          // Suppression du bruit dans la console si la table n'existe pas encore (mode dev/mock)
          if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
            console.warn(`[useData] Table '${tableName}' introuvable sur Supabase. Utilisation des données mockées.`);
          } else {
            console.error(`[${tableName}] Fetch Error:`, errorMessage);
            setError(errorMessage);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // --- REALTIME SUBSCRIPTION ---
    if (enableRealtime) {
      channel = supabase.channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            if (!isMounted) return;

            // Filtrage communautaire côté client pour le realtime (sécurité additionnelle)
            // Note: RLS (Row Level Security) est la vraie barrière, mais ceci évite la pollution UI
            if (communityId && (payload.new as any)?.community_id && (payload.new as any).community_id !== communityId) {
              return;
            }

            const currentData = [...dataRef.current];

            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as T;
              // Ajout en début de liste (hypothèse: trié par date DESC souvent)
              // Idéalement on respecterait 'orderBy' mais c'est complexe en front pur
              const newData = [newItem, ...currentData];
              setData(newData);
              dataRef.current = newData;
            } 
            else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as T;
              const newData = currentData.map(item => item.id === updatedItem.id ? updatedItem : item);
              setData(newData);
              dataRef.current = newData;
            } 
            else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              const newData = currentData.filter(item => item.id !== deletedId);
              setData(newData);
              dataRef.current = newData;
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [tableName, orderBy, communityId, enableRealtime]);

  return { data, loading, error, setData };
}