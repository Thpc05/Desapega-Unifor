import { useNavigate } from 'react-router-dom';
import { ItemForm } from '../components/item/ItemForm';
import { itemsApi } from '../api/items.api';
import styles from './NewItem.module.css';

export function NewItem() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <ItemForm
        heading="Anunciar item"
        submitLabel="Publicar anúncio"
        initialImages={[]}
        onSubmit={async (payload) => {
          await itemsApi.create(payload);
          navigate('/meus');
        }}
      />
    </div>
  );
}
