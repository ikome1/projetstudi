import { useEffect, useState } from 'react';
import { Movie, MovieInput } from '@types/Movie';
import { adminService } from '@services/api';
import styles from './AdminForm.module.css';

type AdminFormProps = {
  initialValues?: Movie | null;
  onSubmit: (values: MovieInput, id?: number) => Promise<void>;
  onCancel?: () => void;
};

const defaultValues: MovieInput = {
  title: '',
  synopsis: '',
  genre: '',
  duration: 90,
  year: new Date().getFullYear(),
  cast: '',
  trailerUrl: '',
  posterUrl: ''
};

const AdminForm = ({ initialValues, onSubmit, onCancel }: AdminFormProps) => {
  const [values, setValues] = useState<MovieInput>(initialValues ?? defaultValues);
  const [loading, setLoading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues ?? defaultValues);
  }, [initialValues]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'year' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values, initialValues?.id);
      if (!initialValues) {
        setValues(defaultValues);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer le film.");
    } finally {
      setLoading(false);
    }
  };

  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    setUploadError(null);
    try {
      const url = await adminService.uploadPoster(file);
      setValues((prev) => ({ ...prev, posterUrl: url }));
    } catch (err) {
      console.error(err);
      setUploadError("Échec de l'envoi de l'affiche. Vérifiez le format (jpg/png/webp) et la taille (<5 Mo).");
    } finally {
      setUploadingPoster(false);
      event.target.value = '';
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label>
          Titre
          <input name="title" value={values.title} onChange={handleChange} required />
        </label>
        <label>
          Genre
          <input name="genre" value={values.genre} onChange={handleChange} placeholder="Science-Fiction" />
        </label>
        <label>
          Année
          <input type="number" name="year" value={values.year} onChange={handleChange} />
        </label>
        <label>
          Durée (minutes)
          <input type="number" name="duration" value={values.duration} onChange={handleChange} />
        </label>
      </div>

      <label>
        Distribution
        <input
          name="cast"
          value={values.cast}
          onChange={handleChange}
          placeholder="Actrice A, Acteur B"
        />
      </label>

      <label>
        Synopsis
        <textarea
          name="synopsis"
          value={values.synopsis}
          onChange={handleChange}
          rows={4}
          placeholder="Résumé du film..."
        />
      </label>

      <div className={styles.grid}>
        <label>
          Bande-annonce (URL)
          <input name="trailerUrl" value={values.trailerUrl} onChange={handleChange} placeholder="https://..." />
        </label>
        <label>
          Affiche (URL)
          <input name="posterUrl" value={values.posterUrl} onChange={handleChange} placeholder="https://..." />
          <span className={styles.helper}>Collez une URL ou téléversez une image ci-dessous.</span>
        </label>
      </div>

      <div className={styles.uploadRow}>
        <label className={styles.uploadLabel}>
          Importer une affiche
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePosterUpload} />
        </label>
        {uploadingPoster && <span className={styles.uploadStatus}>Téléversement en cours...</span>}
        {uploadError && <span className={styles.error}>{uploadError}</span>}
      </div>

      {values.posterUrl && (
        <div className={styles.preview}>
          <img src={values.posterUrl} alt="Aperçu de l'affiche" />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : initialValues ? 'Mettre à jour' : 'Ajouter'}
        </button>
        {onCancel && (
          <button type="button" className={styles.secondary} onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminForm;


