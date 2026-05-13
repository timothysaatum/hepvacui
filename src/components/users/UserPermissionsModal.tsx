import { useEffect, useMemo, useState } from 'react';
import type { User } from '../../types/user';
import { useCreatePermission, usePermissions, useUpdateUserPermissions, useUser } from '../../hooks/useUsers';
import { Button } from '../common/Button';
import { FormField, Input } from '../common';
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
  const { data: loadedUser, isLoading: isUserLoading } = useUser(open && user ? user.id : null);
  const createPermission = useCreatePermission();
  const updatePermissions = useUpdateUserPermissions();
  const displayUser = loadedUser ?? user;
  const initialIds = useMemo(
    () => displayUser?.direct_permissions?.map(permission => permission.id) ?? [],
    [displayUser],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds);
  const [newPermissionName, setNewPermissionName] = useState('');
  const [newPermissionDescription, setNewPermissionDescription] = useState('');

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

  const addPermission = async () => {
    const name = newPermissionName.trim().toLowerCase();
    if (!name) return;
    const permission = await createPermission.mutateAsync({
      name,
      description: newPermissionDescription.trim() || undefined,
    });
    setSelectedIds(current => current.includes(permission.id) ? current : [...current, permission.id]);
    setNewPermissionName('');
    setNewPermissionDescription('');
  };

  return (
    <Modal
      open={open && !!user}
      onClose={onClose}
      title={displayUser ? `Permissions for ${displayUser.full_name}` : 'User Permissions'}
      subtitle="Grant or revoke direct permissions without changing this user's role."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={updatePermissions.isPending}>Save Permissions</Button>
        </>
      }
    >
      {isLoading || isUserLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading permissions...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <FormField label="New Permission">
              <Input
                value={newPermissionName}
                onChange={event => setNewPermissionName(event.target.value)}
                placeholder="patient.archive"
              />
            </FormField>
            <FormField label="Description">
              <Input
                value={newPermissionDescription}
                onChange={event => setNewPermissionDescription(event.target.value)}
                placeholder="Optional"
              />
            </FormField>
            <Button onClick={addPermission} loading={createPermission.isPending}>Create</Button>
          </div>

          <div className="grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
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
        </div>
      )}
    </Modal>
  );
}
