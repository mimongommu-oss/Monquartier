
import { supabase } from './supabase';

export const StorageService = {
  /**
   * Upload une image dans le bucket 'images' de Supabase
   * @param file Le fichier File provenant d'un input type="file"
   * @param path Le chemin/dossier (ex: 'news', 'proofs', 'avatars')
   */
  async uploadImage(file: File, path: string = 'uploads'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images') // Assurez-vous d'avoir créé ce bucket dans Supabase
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
