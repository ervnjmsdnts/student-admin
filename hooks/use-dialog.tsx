import { useState } from 'react';

interface UseDialogHook<T> {
  openAdd: boolean;
  openUpdate: boolean;
  openDelete: boolean;
  entity: T | undefined;
  entityId: string;
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

  return {
    openAdd,
    openUpdate,
    openDelete,
    entity,
    entityId,
    handleOpenAdd,
    handleOpenUpdate,
    handleOpenDelete,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
  };
}
