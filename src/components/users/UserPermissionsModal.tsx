import { useEffect, useMemo, useState } from 'react';
import type { User } from '../../types/user';
import { usePermissions, useUpdateUserPermissions } from '../../hooks/useUsers';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export function UserPermissionsModal({
  user,
  open,
  onClose,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: permissions = [], isLoading } = usePermissions();
  const updatePermissions = useUpdateUserPermissions();
  const initialIds = useMemo(() => user?.direct_permissions?.map(permission => permission.id) ?? [], [user]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds);

  useEffect(() => {
    setSelectedIds(initialIds);
  }, [initialIds]);

  const togglePermission = (permissionId: number) => {
    setSelectedIds(current =>
      current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId],
    );
  };

  const save = async () => {
    if (!user) return;
    await updatePermissions.mutateAsync({ userId: user.id, permissionIds: selectedIds });
    onClose();
  };

  return (
    <Modal
      open={open && !!user}
      onClose={onClose}
      title={user ? `Permissions for ${user.full_name}` : 'User Permissions'}
      subtitle="Grant or revoke direct permissions without changing this user's role."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={updatePermissions.isPending}>Save Permissions</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading permissions...</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {permissions.map(permission => {
            const selected = selectedIds.includes(permission.id);
            return (
              <label
                key={permission.id}
                className={`flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm ${selected ? 'border-teal-200 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => togglePermission(permission.id)}
                  className="h-4 w-4"
                />
                <span className="font-medium">{permission.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
