import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UseDialogHook<T> {
  openAdd: boolean;
  openUpdate: boolean;
  openDelete: boolean;
  entity: T | undefined;
  handleDelete: (dbName: string, name: string) => void;
  handleOpenAdd: () => void;
  handleOpenUpdate: (entity: T) => void;
  handleOpenDelete: (entityId: string) => void;
  handleCloseAdd: () => void;
  handleCloseUpdate: () => void;
  handleCloseDelete: () => void;
}

export default function useDialog<T>(): UseDialogHook<T> {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [entity, setEntity] = useState<undefined | T>(undefined);
  const [entityId, setEntityId] = useState<string>('');

  const handleCloseAdd = () => setOpenAdd(false);
  const handleCloseUpdate = () => setOpenUpdate(false);
  const handleCloseDelete = () => setOpenDelete(false);

  const handleOpenAdd = () => {
    setEntity(undefined);
    setOpenAdd(true);
  };

  const handleOpenUpdate = (data: T) => {
    setEntity(data);
    setOpenUpdate(true);
  };

  const handleOpenDelete = (id: string) => {
    setEntityId(id);
    setOpenDelete(true);
  };

  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (dbName: string, name: string) => {
    const ref = doc(db, dbName, entityId);

    try {
      await deleteDoc(ref);
      handleCloseDelete();
      toast({ title: `Deleted ${name}` });
      router.refresh();
    } catch (_) {
      toast({ title: `Deleting ${name} failed`, variant: 'destructive' });
    }
  };

  return {
    openAdd,
    openUpdate,
    openDelete,
    entity,
    handleOpenAdd,
    handleOpenUpdate,
    handleOpenDelete,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
    handleDelete,
  };
}
